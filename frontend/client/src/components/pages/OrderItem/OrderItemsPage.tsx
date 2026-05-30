import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import LoadingSpinner from '../../LoadingSpinner';
import { getOrderItemData, OrderItem, OrderItemDto, updateOrderItemQuantity, deleteOrderItem } from '../../servicesApi/OrderItemsApi';
import { getProducts, Product } from '../../servicesApi/ProductsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { getNumberOrder } from '../../servicesApi/OrderItemsApi';

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
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [loadingOrderItem, setLoadingOrderItem] = useState(true);
    const [errorOrderItem, setErrorOrderItem] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // состояние товаров
    const [productData, setProductData] = useState<OrderItemDto[]>([]);
    const [productIdData, setProductIdData] = useState<Product[]>([]);

    // состояние модального окна авторизации
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authLogin, setAuthLogin] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // состояние для отслеживания операций
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
    const [updatingQuantityId, setUpdatingQuantityId] = useState<number | null>(null);

    // флаги
    const isMounted = useRef(true);
    const isLoading = useRef(false);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const showError = (message: string) => {
        setServerError(message);
        setTimeout(() => setServerError(null), 5000);
    };

    // получение позиций корзины
    const fetchOrderItem = useCallback(async (showLoader: boolean = true, forceRefresh: boolean = false) => {
        if (!isAuthenticated || !currentUser) {
            setLoadingOrderItem(false);
            return;
        }

        if (isLoading.current && !forceRefresh) return;

        isLoading.current = true;
        if (showLoader && isMounted.current) {
            setLoadingOrderItem(true);
            setErrorOrderItem(null);
        }

        try {
            const orderItem = await getOrderItemData(currentUser?.login || '', currentUser?.role || '');

            if (isMounted.current) {
                setOrderItemData(orderItem);
                setProductData(orderItem?.items || []);
                setErrorOrderItem(null);
            }
        } catch (err: any) {
            console.error('Ошибка загрузки данных корзины:', err);
            if (isMounted.current) {
                if (err.code === 'ERR_BAD_REQUEST') {
                    if (err.response?.status === 404) {
                        setOrderItemData(null);
                        setProductData([]);
                        setErrorOrderItem(null);
                    } else if (err.response?.status === 401) {
                        setShowAuthModal(true);
                    } else {
                        const errorMsg = err.response?.data?.message || err.message || 'Ошибка загрузки данных';
                        setErrorOrderItem(errorMsg);
                    }
                } else {
                    setErrorOrderItem('Ошибка соединения с сервером');
                }
            }
        } finally {
            isLoading.current = false;
            if (showLoader && isMounted.current) {
                setLoadingOrderItem(false);
            }
        }
    }, [isAuthenticated, currentUser]);

    const fetchProductIdData = useCallback(async () => {
        try {
            const products = await getProducts();
            if (isMounted.current) {
                setProductIdData(products);
            }
        } catch (err: any) {
            console.error('Ошибка загрузки данных товара:', err);
        }
    }, []);

    const fetchOrderId = useCallback(async () => {
        if (!currentUser?.id) return;

        try {
            const orderId = await getNumberOrder(currentUser.id);
            if (orderId > 0 && isMounted.current) {
                setCurrentOrderId(orderId);
            }
        } catch (error) {
            console.error('Ошибка получения ID заказа:', error);
        }
    }, [currentUser?.id]);

    // Загрузка данных при монтировании и при изменении авторизации
    useEffect(() => {
        isMounted.current = true;

        if (isAuthenticated && currentUser) {
            fetchOrderItem(true, true);
            fetchProductIdData();
            fetchOrderId();
        } else {
            setLoadingOrderItem(false);
            setOrderItemData(null);
            setProductData([]);
        }

        return () => {
            isMounted.current = false;
        };
    }, [isAuthenticated, currentUser, fetchOrderItem, fetchProductIdData, fetchOrderId]);

    // Подписка на событие обновления корзины
    useEffect(() => {
        const handleCartUpdate = () => {
            if (isMounted.current && isAuthenticated && currentUser) {
                fetchOrderItem(true, true);
                fetchOrderId();
            }
        };

        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [isAuthenticated, currentUser, fetchOrderItem, fetchOrderId]);

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
                await fetchOrderItem(true, true);
                await fetchProductIdData();
                await fetchOrderId();
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

    // функция обновления количества одного товара
    const updateQuantity = async (id: number, newQuantity: number) => {
        if (!isAuthenticated || !currentUser?.id) {
            setShowAuthModal(true);
            return;
        }

        if (newQuantity < 1) return;

        setUpdatingQuantityId(id);
        setServerError(null);

        try {
            await updateOrderItemQuantity(id, newQuantity);
            notifyCartUpdate();
            await fetchOrderItem(true, true);
        } catch (error: any) {
            console.error('Не удалось обновить количество:', error);
            const errorMsg = error.serverMessage || error.message || 'Не удалось обновить количество';
            showError(errorMsg);
            await fetchOrderItem(true, true);
        } finally {
            setUpdatingQuantityId(null);
        }
    };

    // метод удаления товара из корзины
    const removeItem = async (orderId: number | null, productId: number) => {
        if (!isAuthenticated || !currentUser?.id) {
            setShowAuthModal(true);
            return;
        }

        if (!orderId || orderId <= 0) {
            showError('Ошибка: ID заказа не найден. Пожалуйста, обновите страницу.');
            return;
        }

        setDeletingItemId(productId);
        setServerError(null);

        try {
            await deleteOrderItem(orderId, productId, currentUser.id);
            notifyCartUpdate();
            await fetchOrderItem(true, true);

            window.dispatchEvent(new CustomEvent('cartUpdated'));

        } catch (error: any) {
            console.error('Ошибка удаления:', error);
            const errorMsg = error.serverMessage || error.message || 'Не удалось удалить товар из корзины';
            showError(errorMsg);
            await fetchOrderItem(true, true);
        } finally {
            setDeletingItemId(null);
        }
    };

    const handleOrders = () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }
        navigate('/order');
    };

    if (loadingOrderItem && isAuthenticated) {
        return <LoadingSpinner />;
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

                {/* Уведомления */}
                {serverError && (
                    <Alert variant="danger" className={styles.errorAlert} onClose={() => setServerError(null)} dismissible>
                        <Alert.Heading>❌ Ошибка!</Alert.Heading>
                        <p>{serverError}</p>
                    </Alert>
                )}
                {successMessage && (
                    <Alert variant="success" className={styles.successAlert} onClose={() => setSuccessMessage(null)} dismissible>
                        <Alert.Heading>✅ Успешно!</Alert.Heading>
                        <p>{successMessage}</p>
                    </Alert>
                )}

                {!isAuthenticated ? (
                    <div className={styles.emptyCart}>
                        <div className={styles.emptyIcon}>🔒</div>
                        <h2>Требуется авторизация</h2>
                        <p>Пожалуйста, войдите в аккаунт, чтобы просмотреть корзину</p>
                        <div className={styles.buttonGroup}>
                            <Button onClick={() => setShowAuthModal(true)} className={styles.primaryButton}>
                                Войти в аккаунт
                            </Button>
                            <Button onClick={() => navigate('/')} className={styles.secondaryButton}>
                                На главную
                            </Button>
                        </div>
                    </div>
                ) : !orderItemData || orderItemData?.items?.length === 0 ? (
                    <div className={styles.emptyCart}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h2>Корзина пуста</h2>
                        <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                        <Button onClick={() => navigate('/catalog')} className={styles.primaryButton}>
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
                                                    disabled={item.quantity <= 1 || updatingQuantityId === item.id}
                                                >
                                                    −
                                                </Button>
                                                <span className={styles.quantityValue}>
                                                    {updatingQuantityId === item.id ? '...' : item.quantity}
                                                </span>
                                                <Button
                                                    className={styles.quantityBtn}
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={updatingQuantityId === item.id}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <div className={styles.itemTotal}>
                                                {item.totalPrice} ₽
                                            </div>
                                            <Button
                                                className={styles.removeBtn}
                                                onClick={() => removeItem(currentOrderId, item.id)}
                                                disabled={deletingItemId === item.id}
                                            >
                                                {deletingItemId === item.id ? '...' : '✕'}
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
                                        <Button className={styles.checkoutButton} size="lg" onClick={handleOrders}>
                                            Оформить заказ
                                        </Button>
                                        <Link to="/catalog" className={styles.continueLink}>
                                            Продолжить покупки
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>

            <Modal
                show={showAuthModal}
                onHide={() => {
                    setShowAuthModal(false);
                    setAuthError('');
                    setAuthLogin('');
                    setAuthPassword('');
                }}
                centered
                backdrop="static"
            >
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
                        {authError && <div className="text-danger mb-3">{authError}</div>}
                        <Button type="submit" className={styles.modalSubmitButton} disabled={authLoading}>
                            {authLoading ? 'Вход...' : 'Войти'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export { OrderItemsPage };