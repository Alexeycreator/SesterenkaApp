import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';
import { AddressOrder, getShopAddress } from '../../servicesApi/AddressesApi';
import { getOrderItemData, OrderItem, OrderItemDto } from '../../servicesApi/OrderItemsApi';

import styles from './OrderPage.module.css';
import { AddOrder, createOrder, OrderItemsOrderDataDto } from '../../servicesApi/OrderApi';

const OrderPage = () => {
    // для навигации
    const navigate = useNavigate();

    // для проверки авторизации
    const { isAuthenticated, user } = useAuth();

    // состояния пунктов выдачи
    const [addressesData, setAddressesData] = useState<AddressOrder[]>([]);
    const [loadingAddressData, setLoadingAddressData] = useState(true);
    const [errorAddressesData, setErrorAddressesData] = useState<string | null>(null);

    // выбранный пункт выдачи
    const [selectedAddressShop, setSelectedAddressShop] = useState<number | null>(null);

    // состояния корзины
    const [orderItemsData, setOrderItemsData] = useState<OrderItem>();
    const [loadingOrderItemsData, setLoadingOrderItemsData] = useState(true);
    const [errorOrderItemsData, setErrorOrderItemsData] = useState<string | null>(null);

    const [cart, setCart] = useState<OrderItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Состояние для модального окна подтверждения оплаты
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const [itemsData, setItemsData] = useState<OrderItemsOrderDataDto[]>([]);

    // получение адресов пунктов выдачи
    const fetchAddresses = async () => {
        try {
            setLoadingAddressData(true);
            const addresses = await getShopAddress();
            setAddressesData(addresses);
        }
        catch (err: any) {
            console.error('Ошибка загрузки данных товара:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorAddressesData(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorAddressesData(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorAddressesData('Ошибка соединения с сервером');
            }
        }
        finally {
            setLoadingAddressData(false);
        }
    };

    // получение данных корзины пользователя
    const fetchOrderItems = async () => {
        try {
            setLoadingOrderItemsData(true);
            const orderItems = await getOrderItemData(user?.login || '', user?.role || '');
            setOrderItemsData(orderItems);
            if (orderItems != null) {
                const cart = orderItems.items;
                setCart(cart);
            }
        }
        catch (err: any) {
            console.error('Ошибка загрузки данных товара:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorOrderItemsData(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorOrderItemsData(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorOrderItemsData('Ошибка соединения с сервером');
            }
        }
        finally {
            setLoadingOrderItemsData(false);
        }
    };

    // хуки
    useEffect(() => {
        fetchAddresses();
        console.log("я тут");
    }, []);

    useEffect(() => {
        fetchOrderItems();
    }, []);

    const total = orderItemsData?.totalAmount || 0;

    // Обработчик подтверждения заказа с модальным окном
    const handleConfirmOrder = async () => {
        try {
            setSubmitting(true);

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
            alert('Заказ успешно оформлен!');
            navigate(`/personalAccount?userId=${user?.id}&tab=orders`);

        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            alert('Произошла ошибка при оформлении заказа');
            setShowPaymentModal(false);
        } finally {
            setSubmitting(false);
            setIsConfirmed(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (step === 1) {
            if (!selectedAddressShop) {
                alert('Пожалуйста, выберите пункт выдачи');
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
        if (!isConfirmed) {
            setShowPaymentModal(false);
        }
    };

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
                                <span>Товары ({orderItemsData?.totalQuantity} шт.):</span>
                                <span>{orderItemsData?.totalAmount} ₽</span>
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
        </Container>
    );
};

export default OrderPage;