import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import LoadingSpinner from '../../LoadingSpinner';
import { getOrderItemData, OrderItem, OrderItemDto, updateOrderItemQuantity, deleteOrderItem } from '../../servicesApi/OrderItemsApi';
import { getProducts, Product } from '../../servicesApi/ProductsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { getNumberOrder } from '../../servicesApi/OrderItemsApi';

import styles from './OrderItemsPage.module.css';

// Кэш для данных (за пределами компонента)
let cachedOrderItemData: OrderItem | null = null;
let cachedProducts: Product[] | null = null;
let cachedOrderId: number | null = null;
let isLoading = false;
let isInitialized = false;

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
    const [orderItemData, setOrderItemData] = useState<OrderItem | null>(cachedOrderItemData);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(cachedOrderId);
    const [loadingOrderItem, setLoadingOrderItem] = useState(!cachedOrderItemData);
    const [errorOrderItem, setErrorOrderItem] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // состояние товаров
    const [productData, setProductData] = useState<OrderItemDto[]>([]);
    const [productIdData, setProductIdData] = useState<Product[]>(cachedProducts || []);

    // состояние модального окна авторизации
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authLogin, setAuthLogin] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // состояние для отслеживания операций
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
    const [updatingQuantityId, setUpdatingQuantityId] = useState<number | null>(null);

    // флаг для отслеживания первого рендера
    const isFirstRender = useRef(true);
    const previousAuthState = useRef(isAuthenticated);
    const isInitialLoadDone = useRef(false);
    const isMounted = useRef(true);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const showError = (message: string) => {
        setServerError(message);
        setTimeout(() => setServerError(null), 5000);
    };

    // получение позиций корзины
    const fetchOrderItem = async (skipAuthCheck: boolean = false, showLoader: boolean = true, forceRefresh: boolean = false) => {
        if (!skipAuthCheck && (!isAuthenticated || !currentUser)) {
            setLoadingOrderItem(false);
            if (!isAuthenticated) {
                setShowAuthModal(true);
            }
            return;
        }

        // Если данные уже загружены и не принудительное обновление
        if (cachedOrderItemData !== null && !forceRefresh && isInitialized) {
            if (isMounted.current) {
                setOrderItemData(cachedOrderItemData);
                setProductData(cachedOrderItemData?.items || []);
                setLoadingOrderItem(false);
            }
            return;
        }

        // Если уже идет загрузка
        if (isLoading) return;

        isLoading = true;
        if (showLoader && isMounted.current) {
            setLoadingOrderItem(true);
            setErrorOrderItem(null);
        }

        try {
            const orderItem = await getOrderItemData(currentUser?.login || '', currentUser?.role || '');

            // Сохраняем в кэш
            cachedOrderItemData = orderItem;
            isInitialized = true;

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
            isLoading = false;
            if (showLoader && isMounted.current) {
                setLoadingOrderItem(false);
            }
        }
    };

    const fetchProductIdData = async (forceRefresh: boolean = false) => {
        if (cachedProducts !== null && !forceRefresh) {
            if (isMounted.current) {
                setProductIdData(cachedProducts);
            }
            return;
        }

        try {
            const products = await getProducts();
            cachedProducts = products;
            if (isMounted.current) {
                setProductIdData(products);
            }
        } catch (err: any) {
            console.error('Ошибка загрузки данных товара:', err);
        }
    };

    const fetchOrderId = async () => {
        if (!currentUser?.id) return;

        try {
            const orderId = await getNumberOrder(currentUser.id);
            if (orderId > 0) {
                cachedOrderId = orderId;
                if (isMounted.current) {
                    setCurrentOrderId(orderId);
                }
            }
        } catch (error) {
            console.error('Ошибка получения ID заказа:', error);
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
                setOrderItemData(null);
                setProductData([]);
                // Сбрасываем кэш
                cachedOrderItemData = null;
                isInitialized = false;
                await fetchOrderItem(true, true, true);
                await fetchProductIdData(true);
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
        isMounted.current = true;

        if (!isFirstRender.current) {
            if (previousAuthState.current === true && isAuthenticated === false) {
                setOrderItemData(null);
                setProductData([]);
                setLoadingOrderItem(false);
                setShowAuthModal(false);
                notifyCartUpdate();
                navigate('/', { replace: true });
                return;
            }

            if (previousAuthState.current === false && isAuthenticated === true) {
                fetchOrderItem(true, true);
                fetchProductIdData();
                return;
            }
        }

        previousAuthState.current = isAuthenticated;
        isFirstRender.current = false;

        if (isAuthenticated && !isInitialLoadDone.current) {
            isInitialLoadDone.current = true;
            fetchOrderItem(false, true);
            fetchProductIdData();
        } else if (!isAuthenticated) {
            setLoadingOrderItem(false);
        }

        return () => {
            isMounted.current = false;
        };
    }, [isAuthenticated, currentUser]);

    useEffect(() => {
        if (isAuthenticated && currentUser?.id) {
            fetchOrderId();
        }
    }, [isAuthenticated, currentUser]);

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
            // Сбрасываем кэш при изменении
            cachedOrderItemData = null;
            await fetchOrderItem(true, true, true);
        } catch (error: any) {
            console.error('Не удалось обновить количество:', error);
            const errorMsg = error.serverMessage || error.message || 'Не удалось обновить количество';
            showError(errorMsg);
            await fetchOrderItem(true, true, true);
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
            // Сбрасываем кэш при удалении
            cachedOrderItemData = null;
            await fetchOrderItem(true, false, true);
        } catch (error: any) {
            console.error('Ошибка удаления:', error);
            const errorMsg = error.serverMessage || error.message || 'Не удалось удалить товар из корзины';
            showError(errorMsg);
            await fetchOrderItem(true, false, true);
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
                    if (!isAuthenticated) {
                        navigate('/');
                    }
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