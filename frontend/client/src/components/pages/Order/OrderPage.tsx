import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './OrderPage.module.css';

interface CartItem {
    id: number;
    productId: number;
    productName: string;
    priceAtMoment: number;
    quantity: number;
    totalPrice: number;
}

interface CartData {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
}

interface DeliveryAddress {
    fullName: string;
    phone: string;
    email: string;
    comment: string;
}

interface PickupPoint {
    id: number;
    name: string;
    address: string;
    workingHours: string;
    metro: string;
}

const OrderPage = () => {
    // для навигации
    const navigate = useNavigate();

    // для проверки авторизации
    const { isAuthenticated, user } = useAuth();

    
    const [cart, setCart] = useState<CartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Выбранный пункт выдачи
    const [selectedPickupPoint, setSelectedPickupPoint] = useState<number | null>(null);
    
    // Данные получателя
    const [address, setAddress] = useState<DeliveryAddress>({
        fullName: '',
        phone: '',
        email: '',
        comment: ''
    });

    // Пункты выдачи
    const pickupPoints: PickupPoint[] = [
        {
            id: 1,
            name: 'Центральный офис',
            address: 'Москва, ул. Пальмовая, д. 13',
            workingHours: 'Пн-Пт: 9:00-20:00, Сб: 10:00-18:00',
            metro: 'м. Пальмовая'
        },
        {
            id: 2,
            name: 'Склад Санкт-Петербург',
            address: 'Санкт-Петербург, ул. Автомобильная, д. 45',
            workingHours: 'Пн-Пт: 9:00-19:00, Сб: 10:00-17:00',
            metro: 'м. Автомобильная'
        },
        {
            id: 3,
            name: 'Склад Казань',
            address: 'Казань, пр. Ямашева, д. 88',
            workingHours: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00',
            metro: 'м. Ямашева'
        },
        {
            id: 4,
            name: 'Склад Екатеринбург',
            address: 'Екатеринбург, ул. Малышева, д. 123',
            workingHours: 'Пн-Пт: 9:00-19:00, Сб: 10:00-17:00',
            metro: 'м. Малышева'
        }
    ];

    const total = cart?.totalAmount || 0;

    // Загрузка корзины
    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                // TODO: загрузить корзину из API
                // const cartData = await getCart();
                // setCart(cartData);
                
                // Временные данные для теста
                setCart({
                    items: [
                        {
                            id: 1,
                            productId: 1,
                            productName: 'Фильтр масляный MANN-FILTER W 712/8',
                            priceAtMoment: 480,
                            quantity: 2,
                            totalPrice: 960
                        }
                    ],
                    totalQuantity: 2,
                    totalAmount: 960
                });
            } catch (error) {
                console.error('Ошибка загрузки корзины:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    // Заполнение данных пользователя
    useEffect(() => {
        if (user && isAuthenticated) {
            setAddress(prev => ({
                ...prev,
                fullName: `${user.secondName || ''} ${user.firstName || ''}`.trim(),
                email: user.email || '',
                phone: user.phoneNumber || ''
            }));
        }
    }, [user, isAuthenticated]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Проверка авторизации
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (step === 1) {
            // Валидация формы
            if (!address.fullName || !address.phone || !address.email) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            if (!selectedPickupPoint) {
                alert('Пожалуйста, выберите пункт выдачи');
                return;
            }
            
            setStep(2);
            return;
        }

        try {
            setSubmitting(true);

            const orderData = {
                pickupPointId: selectedPickupPoint,
                deliveryAddress: address,
                totalAmount: total,
                items: cart?.items
            };

            // TODO: отправить заказ на сервер
            // await createOrder(orderData);
            // await clearCart();

            alert('Заказ успешно оформлен!');
            navigate(`/personalAccount?userId=${user?.id}&tab=orders`);

        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            alert('Произошла ошибка при оформлении заказа');
        } finally {
            setSubmitting(false);
        }
    };

    const getSelectedPickupPoint = () => {
        return pickupPoints.find(p => p.id === selectedPickupPoint);
    };

    if (loading) {
        return (
            <Container fluid className={styles.pageContainer}>
                <div className={styles.loading}>Загрузка корзины...</div>
            </Container>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Container fluid className={styles.pageContainer}>
                <div className={styles.emptyCart}>
                    <div className={styles.emptyIcon}>🛒</div>
                    <h2>Корзина пуста</h2>
                    <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                    <Button onClick={() => navigate('/catalog')} className={styles.continueButton}>
                        Перейти в каталог
                    </Button>
                </div>
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
                                            {pickupPoints.map(point => (
                                                <label
                                                    key={point.id}
                                                    className={`${styles.pickupOption} ${selectedPickupPoint === point.id ? styles.active : ''}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="pickupPoint"
                                                        value={point.id}
                                                        checked={selectedPickupPoint === point.id}
                                                        onChange={(e) => setSelectedPickupPoint(parseInt(e.target.value))}
                                                    />
                                                    <div className={styles.pickupInfo}>
                                                        <strong>{point.name}</strong>
                                                        <span>📍 {point.address}</span>
                                                        <span>🚇 {point.metro}</span>
                                                        <span>⏰ {point.workingHours}</span>
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
                                                        value={address.fullName}
                                                        onChange={handleAddressChange}
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
                                                        value={address.phone}
                                                        onChange={handleAddressChange}
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
                                                value={address.email}
                                                onChange={handleAddressChange}
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
                                            {cart.items.map((item) => (
                                                <div key={item.id} className={styles.orderItem}>
                                                    <div className={styles.itemInfo}>
                                                        <div className={styles.itemName}>{item.productName}</div>
                                                        <div className={styles.itemQuantity}>x {item.quantity}</div>
                                                    </div>
                                                    <div className={styles.itemPrice}>
                                                        {item.totalPrice} ₽
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <h3 className={styles.sectionTitle}>🏪 Пункт выдачи</h3>
                                        {getSelectedPickupPoint() && (
                                            <div className={styles.pickupSummary}>
                                                <p><strong>{getSelectedPickupPoint()?.name}</strong></p>
                                                <p>📍 {getSelectedPickupPoint()?.address}</p>
                                                <p>🚇 {getSelectedPickupPoint()?.metro}</p>
                                                <p>⏰ {getSelectedPickupPoint()?.workingHours}</p>
                                            </div>
                                        )}

                                        <h3 className={styles.sectionTitle}>👤 Данные получателя</h3>
                                        <div className={styles.addressSummary}>
                                            <p><strong>{address.fullName}</strong></p>
                                            <p>{address.phone}</p>
                                            <p>{address.email}</p>
                                            {address.comment && <p>Комментарий: {address.comment}</p>}
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
                                <span>Товары ({cart.totalQuantity} шт.):</span>
                                <span>{cart.totalAmount} ₽</span>
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