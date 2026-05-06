import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';
import { AddressOrder, getShopAddress } from '../../servicesApi/AddressesApi';
import { getOrderItemData, OrderItem, OrderItemDto } from '../../servicesApi/OrderItemsApi';
import { AddOrder, createOrder } from '../../servicesApi/OrderApi';

import styles from './OrderPage.module.css';

// Кэш для данных (за пределами компонента)
let cachedAddresses: AddressOrder[] | null = null;
let cachedOrderItems: OrderItem | null = null;
let isLoadingAddresses = false;
let isLoadingOrderItems = false;
let isInitialized = false;

const OrderPage = () => {
    // для навигации
    const navigate = useNavigate();

    // для проверки авторизации
    const { isAuthenticated, user } = useAuth();

    // состояния пунктов выдачи
    const [addressesData, setAddressesData] = useState<AddressOrder[]>(cachedAddresses || []);
    const [loadingAddressData, setLoadingAddressData] = useState(!cachedAddresses);
    const [errorAddressesData, setErrorAddressesData] = useState<string | null>(null);

    // выбранный пункт выдачи
    const [selectedAddressShop, setSelectedAddressShop] = useState<number | null>(null);

    // состояния корзины
    const [orderItemsData, setOrderItemsData] = useState<OrderItem | undefined>(cachedOrderItems || undefined);
    const [loadingOrderItemsData, setLoadingOrderItemsData] = useState(!cachedOrderItems);
    const [errorOrderItemsData, setErrorOrderItemsData] = useState<string | null>(null);

    const [cart, setCart] = useState<OrderItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Состояние для модального окна подтверждения оплаты
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const isMounted = useRef(true);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const showError = (message: string) => {
        setServerError(message);
        setTimeout(() => setServerError(null), 5000);
    };

    // получение адресов пунктов выдачи
    const fetchAddresses = async (forceRefresh: boolean = false) => {
        // Если данные уже загружены и не принудительное обновление, используем кэш
        if (cachedAddresses !== null && !forceRefresh && isInitialized) {
            if (isMounted.current) {
                setAddressesData(cachedAddresses);
                setLoadingAddressData(false);
            }
            return;
        }

        // Если уже идет загрузка, ждем
        if (isLoadingAddresses) return;

        isLoadingAddresses = true;
        if (isMounted.current) {
            setLoadingAddressData(true);
            setErrorAddressesData(null);
        }

        try {
            const addresses = await getShopAddress();

            // Сохраняем в кэш
            cachedAddresses = addresses;
            isInitialized = true;

            if (isMounted.current) {
                setAddressesData(addresses);
                setErrorAddressesData(null);
            }
        } catch (err: any) {
            console.error('Ошибка загрузки адресов:', err);
            if (isMounted.current) {
                if (err.code === 'ERR_BAD_REQUEST') {
                    if (err.response?.status === 404) {
                        const serverMessage = err.response.data?.message || 'Информация не найдена';
                        setErrorAddressesData(serverMessage);
                        navigate('/404', { replace: true });
                    } else {
                        const errorMsg = err.response?.data?.message || err.message || 'Ошибка загрузки данных';
                        setErrorAddressesData(errorMsg);
                    }
                } else {
                    setErrorAddressesData('Ошибка соединения с сервером');
                }
            }
        } finally {
            isLoadingAddresses = false;
            if (isMounted.current) {
                setLoadingAddressData(false);
            }
        }
    };

    // получение данных корзины пользователя
    const fetchOrderItems = async (forceRefresh: boolean = false) => {
        if (!user?.login) return;

        // Если данные уже загружены и не принудительное обновление, используем кэш
        if (cachedOrderItems !== null && !forceRefresh) {
            if (isMounted.current) {
                setOrderItemsData(cachedOrderItems);
                setCart(cachedOrderItems.items || []);
                setLoadingOrderItemsData(false);
            }
            return;
        }

        // Если уже идет загрузка, ждем
        if (isLoadingOrderItems) return;

        isLoadingOrderItems = true;
        if (isMounted.current) {
            setLoadingOrderItemsData(true);
            setErrorOrderItemsData(null);
        }

        try {
            const orderItems = await getOrderItemData(user.login, user.role || '');

            // Сохраняем в кэш
            cachedOrderItems = orderItems;

            if (isMounted.current) {
                setOrderItemsData(orderItems);
                setCart(orderItems?.items || []);
                setErrorOrderItemsData(null);
            }
        } catch (err: any) {
            console.error('Ошибка загрузки корзины:', err);
            if (isMounted.current) {
                if (err.code === 'ERR_BAD_REQUEST') {
                    if (err.response?.status === 404) {
                        const serverMessage = err.response.data?.message || 'Корзина не найдена';
                        setErrorOrderItemsData(serverMessage);
                    } else {
                        const errorMsg = err.response?.data?.message || err.message || 'Ошибка загрузки данных';
                        setErrorOrderItemsData(errorMsg);
                    }
                } else {
                    setErrorOrderItemsData('Ошибка соединения с сервером');
                }
            }
        } finally {
            isLoadingOrderItems = false;
            if (isMounted.current) {
                setLoadingOrderItemsData(false);
                setLoading(false);
            }
        }
    };

    // хуки
    useEffect(() => {
        isMounted.current = true;

        fetchAddresses();
        fetchOrderItems();

        // Слушаем событие обновления корзины
        const handleCartUpdate = () => {
            cachedOrderItems = null;
            fetchOrderItems(true);
        };

        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            isMounted.current = false;
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [user?.login]);

    const total = orderItemsData?.totalAmount || 0;

    // Обработчик подтверждения заказа с модальным окном
    const handleConfirmOrder = async () => {
        if (!selectedAddressShop) {
            showError('Пожалуйста, выберите пункт выдачи');
            return;
        }

        try {
            setSubmitting(true);
            setServerError(null);

            const orderData: AddOrder = {
                userLogin: user?.login || '',
                addressId: Number(selectedAddressShop),
                orderItems: orderItemsData?.items.map(oi => ({
                    id: oi.productId,
                    quantity: oi.quantity,
                    price: oi.priceAtMoment,
                    nameProduct: oi.nameProducts
                })) || []
            };

            await createOrder(orderData);

            // Закрываем модальное окно и показываем успех
            setShowPaymentModal(false);
            showSuccess('Заказ успешно оформлен!');

            // Очищаем кэш корзины
            cachedOrderItems = null;

            setTimeout(() => {
                navigate(`/personalAccount?userId=${user?.id}&tab=orders`);
            }, 1500);
        } catch (error: any) {
            console.error('Ошибка оформления заказа:', error);
            const errorMsg = error.serverMessage || error.message || 'Произошла ошибка при оформлении заказа';
            showError(errorMsg);
            setShowPaymentModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (step === 1) {
            if (!selectedAddressShop) {
                showError('Пожалуйста, выберите пункт выдачи');
                return;
            }

            setStep(2);
            return;
        }

        // Шаг 2 - показываем модальное окно с информацией об оплате
        setShowPaymentModal(true);
    };

    const getSelectedAddressShop = () => {
        return addressesData.find(a => a.id === selectedAddressShop);
    };

    // Сброс подтверждения при закрытии модального окна
    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
    };

    if (loadingAddressData || loadingOrderItemsData) {
        return (
            <Container fluid className={styles.pageContainer}>
                <div className={styles.loading}>Загрузка данных...</div>
            </Container>
        );
    }

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Модальное окно авторизации */}
            {showAuthModal && (
                <div className={styles.authModal}>
                    <div className={styles.authModalContent}>
                        <h3>Требуется авторизация</h3>
                        <p>Для оформления заказа необходимо войти в аккаунт</p>
                        <div className={styles.authModalButtons}>
                            <Button onClick={() => navigate('/login')} className={styles.loginButton}>
                                Войти
                            </Button>
                            <Button onClick={() => setShowAuthModal(false)} className={styles.cancelButton}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Модальное окно для подтверждения оплаты наличными */}
            <Modal
                show={showPaymentModal}
                onHide={handleClosePaymentModal}
                centered
                backdrop="static"
                className={styles.paymentModal}
            >
                <Modal.Header closeButton={!submitting}>
                    <Modal.Title className={styles.paymentModalTitle}>
                        💳 Способ оплаты
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.paymentModalBody}>
                    <div className={styles.paymentInfo}>
                        <div className={styles.paymentIcon}>💰</div>
                        <h4>Оплата наличными</h4>
                        <p className={styles.paymentDescription}>
                            Оплата заказа производится <strong>наличными</strong> при получении товара в магазине.
                        </p>
                        <div className={styles.paymentDetails}>
                            <div className={styles.paymentDetailItem}>
                                <span className={styles.detailIcon}>📍</span>
                                <span>Пункт выдачи: <strong>{getSelectedAddressShop()?.city}, ул. {getSelectedAddressShop()?.street}, д. {getSelectedAddressShop()?.house}</strong></span>
                            </div>
                            <div className={styles.paymentDetailItem}>
                                <span className={styles.detailIcon}>💵</span>
                                <span>Сумма к оплате: <strong>{total} ₽</strong></span>
                            </div>
                            <div className={styles.paymentDetailItem}>
                                <span className={styles.detailIcon}>📦</span>
                                <span>Способ получения: <strong>Самовывоз</strong></span>
                            </div>
                        </div>
                        <div className={styles.paymentWarning}>
                            ⚠️ Внимание: На данный момент доступна только оплата наличными при получении.
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.paymentModalFooter}>
                    <Button
                        variant="outline-secondary"
                        onClick={handleClosePaymentModal}
                        disabled={submitting}
                        className={styles.cancelPaymentButton}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirmOrder}
                        disabled={submitting}
                        className={styles.confirmPaymentButton}
                    >
                        {submitting ? 'Оформление...' : 'Подтвердить заказ'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <h1 className={styles.title}>Оформление заказа</h1>
                    <p className={styles.subtitle}>
                        Шаг {step} из 2: {step === 1 ? 'Данные получателя' : 'Подтверждение заказа'}
                    </p>
                </Col>
            </Row>

            {/* Ошибки загрузки данных */}
            {errorAddressesData && (
                <Alert variant="danger" className={styles.errorAlert}>
                    <p>Ошибка загрузки адресов: {errorAddressesData}</p>
                </Alert>
            )}
            {errorOrderItemsData && (
                <Alert variant="danger" className={styles.errorAlert}>
                    <p>Ошибка загрузки корзины: {errorOrderItemsData}</p>
                </Alert>
            )}

            {(!orderItemsData || orderItemsData?.items?.length === 0) ? (
                <div className={styles.emptyCart}>
                    <div className={styles.emptyIcon}>🛒</div>
                    <h2>Корзина пуста</h2>
                    <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                    <Button onClick={() => navigate('/catalog')} className={styles.continueButton}>
                        Перейти в каталог
                    </Button>
                </div>
            ) : (
                <Row>
                    {/* Форма оформления */}
                    <Col lg={8}>
                        <Card className={styles.checkoutCard}>
                            <Card.Body>
                                <form onSubmit={handleSubmit}>
                                    {step === 1 ? (
                                        // Шаг 1: Данные получателя и выбор пункта выдачи
                                        <>
                                            <h3 className={styles.sectionTitle}>🏪 Пункт выдачи</h3>
                                            <div className={styles.pickupPoints}>
                                                {addressesData.map(shop => (
                                                    <label
                                                        key={shop.id}
                                                        className={`${styles.pickupOption} ${selectedAddressShop === shop.id ? styles.active : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="pickupPoint"
                                                            value={shop.id}
                                                            checked={selectedAddressShop === shop.id}
                                                            onChange={(e) => setSelectedAddressShop(parseInt(e.target.value))}
                                                        />
                                                        <div className={styles.pickupInfo}>
                                                            <strong>{shop.city}</strong>
                                                            <span>📍 ул. {shop.street}</span>
                                                            <span>📍 д. {shop.house}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>

                                            <h3 className={styles.sectionTitle}>👤 Данные получателя</h3>
                                            {!isAuthenticated && (
                                                <Alert variant="warning" className={styles.authWarning}>
                                                    ⚠️ Для оформления заказа необходимо <Button variant="link" onClick={() => navigate('/login')}>войти</Button> в аккаунт
                                                </Alert>
                                            )}

                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>ФИО *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="fullName"
                                                            value={`${user?.secondName} ${user?.firstName} ${user?.surName}`}
                                                            required
                                                            disabled={!isAuthenticated}
                                                            placeholder="Иванов Иван Иванович"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Телефон *</Form.Label>
                                                        <Form.Control
                                                            type="tel"
                                                            name="phone"
                                                            value={user?.phoneNumber}
                                                            required
                                                            disabled={!isAuthenticated}
                                                            placeholder="+7 (999) 123-45-67"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Email *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={user?.email}
                                                    required
                                                    disabled={!isAuthenticated}
                                                    placeholder="example@mail.ru"
                                                />
                                            </Form.Group>
                                        </>
                                    ) : (
                                        // Шаг 2: Подтверждение заказа
                                        <>
                                            <h3 className={styles.sectionTitle}>📋 Ваш заказ</h3>
                                            <div className={styles.orderItems}>
                                                {orderItemsData?.items.map((item) => (
                                                    <div key={item.id} className={styles.orderItem}>
                                                        <div className={styles.itemInfo}>
                                                            <div className={styles.itemName}>{item.nameProducts}</div>
                                                            <div className={styles.itemQuantity}>x {item.quantity}</div>
                                                        </div>
                                                        <div className={styles.itemPrice}>
                                                            {item.totalPrice} ₽
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <h3 className={styles.sectionTitle}>🏪 Пункт выдачи</h3>
                                            {getSelectedAddressShop() && (
                                                <div className={styles.pickupSummary}>
                                                    <p><strong>{getSelectedAddressShop()?.city}</strong></p>
                                                    <p>📍ул. {getSelectedAddressShop()?.street}</p>
                                                    <p>📍д. {getSelectedAddressShop()?.house}</p>
                                                </div>
                                            )}

                                            <h3 className={styles.sectionTitle}>👤 Данные получателя</h3>
                                            <div className={styles.addressSummary}>
                                                <p><strong>{user?.secondName} {user?.firstName} {user?.surName}</strong></p>
                                                <p>{user?.phoneNumber}</p>
                                                <p>{user?.email}</p>
                                            </div>
                                        </>
                                    )}

                                    <div className={styles.formActions}>
                                        {step === 2 && (
                                            <Button
                                                type="button"
                                                variant="outline-secondary"
                                                onClick={() => setStep(1)}
                                                className={styles.backButton}
                                            >
                                                ← Назад
                                            </Button>
                                        )}

                                        <Button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={submitting || (!isAuthenticated && step === 1)}
                                        >
                                            {step === 1
                                                ? 'Продолжить →'
                                                : submitting ? 'Оформление...' : 'Подтвердить заказ'}
                                        </Button>
                                    </div>
                                </form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Итоговая информация */}
                    <Col lg={4}>
                        <Card className={styles.summaryCard}>
                            <Card.Body>
                                <h3 className={styles.summaryTitle}>Итого</h3>

                                <div className={styles.summaryRow}>
                                    <span>Товары ({orderItemsData?.totalQuantity || 0} шт.):</span>
                                    <span>{orderItemsData?.totalAmount || 0} ₽</span>
                                </div>

                                <div className={styles.summaryDivider}></div>

                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span>Итого к оплате:</span>
                                    <span className={styles.totalAmount}>{total} ₽</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default OrderPage;