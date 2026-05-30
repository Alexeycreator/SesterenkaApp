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
    const navigate = useNavigate();
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

    // Состояния для редактируемых полей получателя
    const [recipientData, setRecipientData] = useState({
        fullName: '',
        phone: '',
        email: ''
    });
    const [fieldErrors, setFieldErrors] = useState<{
        phone?: string;
        email?: string;
    }>({});

    const isMounted = useRef(true);

    // Форматирование ФИО (без пустого отчества)
    const formatFullName = () => {
        const parts = [
            user?.secondName,
            user?.firstName,
            user?.surName
        ].filter(part => part && part.trim());
        return parts.join(' ');
    };

    // Валидация телефона
    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^(\+7|7|8)\d{10}$/;
        return phoneRegex.test(phone);
    };

    // Валидация email
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Валидация формы получателя
    const validateRecipientForm = (): boolean => {
        const errors: { phone?: string; email?: string } = {};

        if (recipientData.phone && !validatePhone(recipientData.phone)) {
            errors.phone = 'Неверный формат телефона. Используйте: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX';
        }

        if (recipientData.email && !validateEmail(recipientData.email)) {
            errors.email = 'Неверный формат email';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

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
        if (cachedAddresses !== null && !forceRefresh && isInitialized) {
            if (isMounted.current) {
                setAddressesData(cachedAddresses);
                setLoadingAddressData(false);
            }
            return;
        }

        if (isLoadingAddresses) return;

        isLoadingAddresses = true;
        if (isMounted.current) {
            setLoadingAddressData(true);
            setErrorAddressesData(null);
        }

        try {
            const addresses = await getShopAddress();
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

        if (cachedOrderItems !== null && !forceRefresh) {
            if (isMounted.current) {
                setOrderItemsData(cachedOrderItems);
                setCart(cachedOrderItems.items || []);
                setLoadingOrderItemsData(false);
            }
            return;
        }

        if (isLoadingOrderItems) return;

        isLoadingOrderItems = true;
        if (isMounted.current) {
            setLoadingOrderItemsData(true);
            setErrorOrderItemsData(null);
        }

        try {
            const orderItems = await getOrderItemData(user.login, user.role || '');
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

    // Инициализация данных получателя из профиля
    useEffect(() => {
        if (user) {
            setRecipientData({
                fullName: formatFullName(),
                phone: user.phoneNumber || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // хуки
    useEffect(() => {
        isMounted.current = true;

        fetchAddresses();
        fetchOrderItems();

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

    // Обработчик изменения полей получателя
    const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRecipientData(prev => ({ ...prev, [name]: value }));

        // Очищаем ошибки при изменении
        if (name === 'phone' && fieldErrors.phone) {
            setFieldErrors(prev => ({ ...prev, phone: undefined }));
        }
        if (name === 'email' && fieldErrors.email) {
            setFieldErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    // Обработчик для телефона с форматированием
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        let formattedValue = value;
        if (value.startsWith('8') || value.startsWith('7')) {
            formattedValue = value;
        } else if (value.startsWith('9') && value.length === 10) {
            formattedValue = `+7${value}`;
        }

        setRecipientData(prev => ({ ...prev, phone: formattedValue }));

        if (fieldErrors.phone) {
            setFieldErrors(prev => ({ ...prev, phone: undefined }));
        }
    };

    const total = orderItemsData?.totalAmount || 0;

    const handleConfirmOrder = async () => {
        if (!selectedAddressShop) {
            showError('Пожалуйста, выберите пункт выдачи');
            return;
        }

        if (!validateRecipientForm()) {
            showError('Пожалуйста, исправьте ошибки в форме');
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

            setShowPaymentModal(false);
            showSuccess('Заказ успешно оформлен!');

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

            if (!validateRecipientForm()) {
                showError('Пожалуйста, исправьте ошибки в форме');
                return;
            }

            setStep(2);
            return;
        }

        setShowPaymentModal(true);
    };

    const getSelectedAddressShop = () => {
        return addressesData.find(a => a.id === selectedAddressShop);
    };

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
                    <Col lg={8}>
                        <Card className={styles.checkoutCard}>
                            <Card.Body>
                                <form onSubmit={handleSubmit}>
                                    {step === 1 ? (
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
                                                            value={recipientData.fullName}
                                                            onChange={handleRecipientChange}
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
                                                            value={recipientData.phone}
                                                            onChange={handlePhoneChange}
                                                            isInvalid={!!fieldErrors.phone}
                                                            required
                                                            disabled={!isAuthenticated}
                                                            placeholder="+7XXXXXXXXXX"
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {fieldErrors.phone}
                                                        </Form.Control.Feedback>
                                                        <Form.Text className="text-muted">
                                                            Формат: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Email *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={recipientData.email}
                                                    onChange={handleRecipientChange}
                                                    isInvalid={!!fieldErrors.email}
                                                    required
                                                    disabled={!isAuthenticated}
                                                    placeholder="example@mail.ru"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {fieldErrors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </>
                                    ) : (
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
                                                <p><strong>{recipientData.fullName}</strong></p>
                                                <p>{recipientData.phone}</p>
                                                <p>{recipientData.email}</p>
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