import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import LoadingSpinner from '../../LoadingSpinner';
import { getOrderItemData, OrderItem, OrderItemDto, updateOrderItemQuantity, deleteOrderItem } from '../../servicesApi/OrderItemsApi';
import { getProducts, Product } from '../../servicesApi/ProductsApi';
import { useAuth } from '../../../contexts/AuthContext';

import styles from './OrderItemsPage.module.css';

// Функция для уведомления об изменении корзины
const notifyCartUpdate = () => {
    const event = new CustomEvent('cartUpdated');
    window.dispatchEvent(event);
};

const OrderItemsPage = () => {
    const api = process.env.REACT_APP_API_URL_IMAGES || 'http://localhost:5027';
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated, login } = useAuth();

    // состояние корзины
    const [orderItemData, setOrderItemData] = useState<OrderItem | null>(null);
    const [loadingOrderItem, setLoadingOrderItem] = useState(true);
    const [errorOrderItem, setErrorOrderItem] = useState<string | null>(null);

    // состояние товаров
    const [productData, setProductData] = useState<OrderItemDto[]>([]);
    const [productIdData, setProductIdData] = useState<Product[]>([]);

    // состояние модального окна авторизации
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authLogin, setAuthLogin] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // флаг для отслеживания первого рендера и предотвращения лишних вызовов
    const isFirstRender = useRef(true);
    const previousAuthState = useRef(isAuthenticated);

    // получение позиций корзины
    const fetchOrderItem = async (skipAuthCheck: boolean = false) => {
        // Проверка авторизации перед запросом (если не пропущена проверка)
        if (!skipAuthCheck && (!isAuthenticated || !currentUser)) {
            setLoadingOrderItem(false);
            // Показываем модальное окно только если пользователь не авторизован
            if (!isAuthenticated) {
                setShowAuthModal(true);
            }
            return;
        }

        try {
            setLoadingOrderItem(true);
            const orderItem = await getOrderItemData(currentUser?.login || '', currentUser?.role || '');
            setOrderItemData(orderItem);
            if (orderItem != null) {
                const products = orderItem.items;
                setProductData(products);
                // Уведомляем об обновлении корзины
                notifyCartUpdate();
            } else {
                // Если корзина пуста или не найдена, устанавливаем пустой массив
                setProductData([]);
                notifyCartUpdate();
            }
        }
        catch (err: any) {
            console.error('Ошибка загрузки данных корзины:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    // Если корзина не найдена - это не ошибка, просто пустая корзина
                    setOrderItemData(null);
                    setProductData([]);
                    setErrorOrderItem(null);
                    notifyCartUpdate();
                } else if (err.response?.status === 401) {
                    setShowAuthModal(true);
                } else {
                    setErrorOrderItem(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorOrderItem('Ошибка соединения с сервером');
            }
        }
        finally {
            setLoadingOrderItem(false);
        }
    };

    const fetchProductIdData = async () => {
        try {
            const products = await getProducts();
            setProductIdData(products);
        }
        catch (err: any) {
            console.error('Ошибка загрузки данных товара:', err);
        }
    };

    // Обработчик авторизации через модальное окно
    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);

        try {
            const success = await login(authLogin, authPassword);
            if (success) {
                setShowAuthModal(false);
                setAuthLogin('');
                setAuthPassword('');
                // Очищаем предыдущие данные перед загрузкой
                setOrderItemData(null);
                setProductData([]);
                // После успешной авторизации перезагружаем корзину
                await fetchOrderItem(true);
                // Обновляем список товаров
                await fetchProductIdData();
                // Уведомляем об обновлении корзины
                notifyCartUpdate();
            } else {
                setAuthError('Неверный логин или пароль');
            }
        } catch (err: any) {
            setAuthError(err.message || 'Ошибка при входе');
        } finally {
            setAuthLoading(false);
        }
    };

    // хуки
    useEffect(() => {
        // Отслеживаем изменение состояния авторизации
        if (!isFirstRender.current) {
            // Если пользователь вышел из системы
            if (previousAuthState.current === true && isAuthenticated === false) {
                setOrderItemData(null);
                setProductData([]);
                setLoadingOrderItem(false);
                setShowAuthModal(false);
                notifyCartUpdate(); // Уведомляем об очистке корзины
                navigate('/', { replace: true });
                return;
            }

            // Если пользователь только что авторизовался
            if (previousAuthState.current === false && isAuthenticated === true) {
                fetchOrderItem(true);
                fetchProductIdData();
                return;
            }
        }

        // Сохраняем предыдущее состояние
        previousAuthState.current = isAuthenticated;
        isFirstRender.current = false;

        // Первоначальная загрузка
        if (isAuthenticated) {
            fetchOrderItem(false);
            fetchProductIdData();
        } else {
            setLoadingOrderItem(false);
        }
    }, [isAuthenticated, currentUser]);

    // метод для поиска товара
    const findProduct = (partNumber: string) => {
        try {
            const product = productIdData.find((p) => p.partNumber === partNumber);
            if (product) {
                return product.id;
            } else {
                console.warn('Товар с артикулом: ', partNumber, ' не найден');
                return null;
            }
        }
        catch (error: any) {
            console.error(error);
        }
    };

    // функция обновления количества одного товара
    const updateQuantity = async (id: number, newQuantity: number) => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (newQuantity < 1) {
            return;
        }

        setProductData(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );

        try {
            const result = await updateOrderItemQuantity(id, newQuantity);
            if (result) {
                setProductData(result.items);
                setOrderItemData(result);
                // Уведомляем об обновлении корзины
                notifyCartUpdate();
            }
        } catch (error: any) {
            setProductData(prevItems =>
                prevItems.map(item =>
                    item.id === id ? { ...item, quantity: item.quantity } : item
                )
            );
            console.error('Не удалось обновить количество');
        }
        await fetchOrderItem(true);
    };

    // метод удаления товара из корзины
    const removeItem = async (partNumber: string) => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        try {
            setLoadingOrderItem(true);
            const id = findProduct(partNumber);
            if (id != null) {
                await deleteOrderItem(id);
                // Уведомляем об обновлении корзины
                notifyCartUpdate();
            }
            await fetchOrderItem(true);
        } catch (error: any) {
            console.error('Ошибка удаления:', error);
            if (error.statusCode === 404) {
                await fetchOrderItem(true);
            }
        } finally {
            setLoadingOrderItem(false);
        }
    };

    const handleOrders = () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }
        navigate('/order');
    };

    // Если идет загрузка и пользователь авторизован
    if (loadingOrderItem && isAuthenticated) {
        return <LoadingSpinner />
    }

    return (
        <>
            <Container fluid className={styles.pageContainer}>
                <Row className="mb-4">
                    <Col>
                        <h1 className={styles.title}>Корзина</h1>
                        <p className={styles.subtitle}>
                            {orderItemData?.items?.length || 0} {orderItemData?.items?.length === 1 ? 'товар' : 'товаров'} в корзине
                        </p>
                    </Col>
                </Row>

                {!isAuthenticated ? (
                    <div className={styles.emptyCart}>
                        <div className={styles.emptyIcon}>🔒</div>
                        <h2>Требуется авторизация</h2>
                        <p>Пожалуйста, войдите в аккаунт, чтобы просмотреть корзину</p>
                        <div className={styles.buttonGroup}>
                            <Button
                                onClick={() => setShowAuthModal(true)}
                                className={styles.primaryButton}
                            >
                                Войти в аккаунт
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                className={styles.secondaryButton}
                            >
                                На главную
                            </Button>
                        </div>
                    </div>
                ) : !orderItemData || orderItemData?.items?.length === 0 ? (
                    <div className={styles.emptyCart}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h2>Корзина пуста</h2>
                        <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                        <Button
                            onClick={() => navigate('/catalog')}
                            className={styles.primaryButton}
                        >
                            Перейти в каталог
                        </Button>
                    </div>
                ) : (
                    <>
                        <Row>
                            <Col lg={8}>
                                <div className={styles.cartItems}>
                                    {productData?.map((item) => (
                                        <div key={item.id} className={styles.cartItem}>
                                            <div className={styles.itemImage}>
                                                <img
                                                    src={`${api}/${item.imageProduct}`}
                                                    alt={item.nameProducts}
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/placeholder.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemCategory}>{item.nameCategories}</div>
                                                <h3 className={styles.itemName}>{item.nameProducts}</h3>
                                                <div className={styles.itemBrand}>{item.nameManufacturers}</div>
                                                <div className={styles.itemArticle}>Арт: {item.partNumber}</div>
                                            </div>
                                            <div className={styles.itemPrice}>
                                                <div className={styles.currentPrice}>{item.priceAtMoment} ₽</div>
                                            </div>
                                            <div className={styles.itemQuantity}>
                                                <Button
                                                    className={styles.quantityBtn}
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    −
                                                </Button>
                                                <span className={styles.quantityValue}>{item.quantity}</span>
                                                <Button
                                                    className={styles.quantityBtn}
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <div className={styles.itemTotal}>
                                                {item.totalPrice} ₽
                                            </div>
                                            <Button
                                                className={styles.removeBtn}
                                                onClick={() => removeItem(item.partNumber)}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Col>

                            <Col lg={4}>
                                <Card className={styles.orderSummary}>
                                    <Card.Body>
                                        <h3 className={styles.summaryTitle}>Ваш заказ</h3>
                                        <div className={styles.summaryRow}>
                                            <span>Товары ({orderItemData?.totalQuantity || 0} шт.)</span>
                                            <span>{orderItemData?.totalAmount || 0} ₽</span>
                                        </div>
                                        <div className={styles.summaryDivider} />
                                        <div className={styles.summaryTotal}>
                                            <span>Итого</span>
                                            <span className={styles.totalAmount}>{orderItemData?.totalAmount || 0} ₽</span>
                                        </div>
                                        <Button
                                            className={styles.checkoutButton}
                                            size="lg"
                                            onClick={handleOrders}
                                        >
                                            Оформить заказ
                                        </Button>
                                        <Link
                                            to="/catalog"
                                            className={styles.continueLink}
                                        >
                                            Продолжить покупки
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>

            <Modal show={showAuthModal} onHide={() => {
                if (!isAuthenticated) {
                    navigate('/');
                }
                setShowAuthModal(false);
                setAuthError('');
                setAuthLogin('');
                setAuthPassword('');
            }} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Вход в аккаунт</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAuthSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Логин</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите ваш логин"
                                value={authLogin}
                                onChange={(e) => setAuthLogin(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Введите пароль"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        {authError && (
                            <div className="text-danger mb-3">
                                {authError}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className={styles.modalSubmitButton}
                            disabled={authLoading}
                        >
                            {authLoading ? 'Вход...' : 'Войти'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export { OrderItemsPage };