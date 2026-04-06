import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './OrderDetailsPage.module.css';

interface OrderItem {
    id: number;
    quantity: number;
    priceAtMoment: number;
    nameProducts: string;
    partNumber: string;
    imageProduct: string;
    nameCategories: string;
    nameManufacturers: string;
    totalPrice: number;
}

interface OrderDetails {
    id: number;
    orderDate: string;
    status: string;
    totalAmount: number;
    totalQuantity: number;
    items: OrderItem[];
    deliveryAddress?: string;
    paymentMethod?: string;
    comment?: string;
}

// Моковые данные для заказов
const mockOrders: Record<number, OrderDetails> = {
    1: {
        id: 1,
        orderDate: '2024-03-15T10:30:00',
        status: 'Выдан',
        totalAmount: 2340,
        totalQuantity: 3,
        deliveryAddress: 'Москва, ул. Пальмовая, д. 13, кв. 42',
        paymentMethod: 'Банковская карта',
        comment: 'Позвонить за 15 минут',
        items: [
            {
                id: 1,
                quantity: 2,
                priceAtMoment: 480,
                nameProducts: 'Фильтр масляный Mann-Filter W 712/8',
                partNumber: 'W712/8',
                imageProduct: 'Images/Products/OilFilter/w712_8.jpeg',
                nameCategories: 'Масляные фильтры',
                nameManufacturers: 'Mann-Filter',
                totalPrice: 960
            },
            {
                id: 2,
                quantity: 1,
                priceAtMoment: 890,
                nameProducts: 'Фильтр салонный угольный Mann-Filter CUK 2939',
                partNumber: 'CUK2939',
                imageProduct: 'Images/Products/CabinFilter/cuk2939.jpg',
                nameCategories: 'Салонные фильтры',
                nameManufacturers: 'Mann-Filter',
                totalPrice: 890
            },
            {
                id: 3,
                quantity: 1,
                priceAtMoment: 490,
                nameProducts: 'Свеча зажигания NGK BKR6E-11',
                partNumber: 'BKR6E11',
                imageProduct: 'Images/Products/SparkPlug/bkr6e11.jpg',
                nameCategories: 'Свечи зажигания',
                nameManufacturers: 'NGK',
                totalPrice: 490
            }
        ]
    },
    2: {
        id: 2,
        orderDate: '2024-03-10T14:20:00',
        status: 'В обработке',
        totalAmount: 1780,
        totalQuantity: 2,
        deliveryAddress: 'Москва, ул. Тверская, д. 15, офис 304',
        paymentMethod: 'Наличными при получении',
        comment: '',
        items: [
            {
                id: 4,
                quantity: 1,
                priceAtMoment: 680,
                nameProducts: 'Фильтр воздушный Mann-Filter C 25 108',
                partNumber: 'C25108',
                imageProduct: 'Images/Products/AirFilter/c25108.jpg',
                nameCategories: 'Воздушные фильтры',
                nameManufacturers: 'Mann-Filter',
                totalPrice: 680
            },
            {
                id: 5,
                quantity: 2,
                priceAtMoment: 550,
                nameProducts: 'Тормозные колодки передние TRW GDB 1421',
                partNumber: 'GDB1421',
                imageProduct: 'Images/Products/BrakePads/gdb1421.jpg',
                nameCategories: 'Тормозные колодки',
                nameManufacturers: 'TRW',
                totalPrice: 1100
            }
        ]
    },
    3: {
        id: 3,
        orderDate: '2024-03-05T09:15:00',
        status: 'Собран',
        totalAmount: 5670,
        totalQuantity: 5,
        deliveryAddress: 'Москва, ул. Пальмовая, д. 13, кв. 42',
        paymentMethod: 'Онлайн-платеж',
        comment: 'Оставить у двери',
        items: [
            {
                id: 6,
                quantity: 2,
                priceAtMoment: 1250,
                nameProducts: 'Ремень ГРМ Gates 5345XS',
                partNumber: '5345XS',
                imageProduct: 'Images/Products/TimingBelt/5345xs.jpg',
                nameCategories: 'Ремни ГРМ',
                nameManufacturers: 'Gates',
                totalPrice: 2500
            },
            {
                id: 7,
                quantity: 1,
                priceAtMoment: 1650,
                nameProducts: 'Ролик натяжителя SKF VKM 12345',
                partNumber: 'VKM12345',
                imageProduct: 'Images/Products/Tensioner/vkm12345.jpg',
                nameCategories: 'Ролики натяжители',
                nameManufacturers: 'SKF',
                totalPrice: 1650
            },
            {
                id: 8,
                quantity: 2,
                priceAtMoment: 760,
                nameProducts: 'Помпа водяная SKF VKPC 87654',
                partNumber: 'VKPC87654',
                imageProduct: 'Images/Products/WaterPump/vkpc87654.jpg',
                nameCategories: 'Помпы',
                nameManufacturers: 'SKF',
                totalPrice: 1520
            }
        ]
    },
    4: {
        id: 4,
        orderDate: '2024-02-28T16:45:00',
        status: 'Отменен',
        totalAmount: 890,
        totalQuantity: 1,
        deliveryAddress: 'Москва, ул. Автомобильная, д. 45',
        paymentMethod: 'Банковская карта',
        comment: 'Отменен по просьбе клиента',
        items: [
            {
                id: 9,
                quantity: 1,
                priceAtMoment: 890,
                nameProducts: 'Фильтр топливный Mann-Filter WK 31/2',
                partNumber: 'WK312',
                imageProduct: 'Images/Products/FuelFilter/wk312.jpg',
                nameCategories: 'Топливные фильтры',
                nameManufacturers: 'Mann-Filter',
                totalPrice: 890
            }
        ]
    }
};

const OrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Форматирование даты
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Получение статуса заказа
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'В корзине':
                return <Badge className={styles.statusBasket}>🛒 {status}</Badge>;
            case 'В обработке':
                return <Badge className={styles.statusProcessing}>⏳ {status}</Badge>;
            case 'Собран':
                return <Badge className={styles.statusReady}>📦 {status}</Badge>;
            case 'Выдан':
                return <Badge className={styles.statusCompleted}>✅ {status}</Badge>;
            case 'Отменен':
                return <Badge className={styles.statusCancelled}>❌ {status}</Badge>;
            default:
                return <Badge className={styles.statusProcessing}>{status}</Badge>;
        }
    };

    // Загрузка данных заказа (с имитацией задержки)
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Имитация задержки сети
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const orderId = Number(id);
                const mockOrder = mockOrders[orderId];
                
                if (mockOrder) {
                    setOrder(mockOrder);
                } else {
                    setError('Заказ не найден');
                }
            } catch (err: any) {
                console.error('Ошибка загрузки заказа:', err);
                setError('Не удалось загрузить данные заказа');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <Container fluid className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}>⏳</div>
                    <p>Загрузка данных заказа...</p>
                </div>
            </Container>
        );
    }

    if (error || !order) {
        return (
            <Container fluid className={styles.pageContainer}>
                <div className={styles.errorContainer}>
                    <h2>Ошибка</h2>
                    <p>{error || 'Заказ не найден'}</p>
                    <Link to="/personalAccount?tab=orders">
                        <Button className={styles.backButton}>← Вернуться к заказам</Button>
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Хлебные крошки */}
            <div className={styles.breadcrumbs}>
                <Link to="/">Главная</Link>
                <span>/</span>
                <Link to="/personalAccount?tab=orders">Мои заказы</Link>
                <span>/</span>
                <span className={styles.current}>Заказ #{order.id}</span>
            </div>

            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <div className={styles.header}>
                        <Button
                            variant="link"
                            className={styles.backButton}
                            onClick={() => navigate('/personalAccount?tab=orders')}
                        >
                            ← Назад к заказам
                        </Button>
                        <h1 className={styles.title}>Заказ #{order.id}</h1>
                        <div className={styles.statusWrapper}>
                            {getStatusBadge(order.status)}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                {/* Информация о заказе */}
                <Col lg={8}>
                    <Card className={styles.infoCard}>
                        <Card.Body>
                            <h3 className={styles.sectionTitle}>📋 Информация о заказе</h3>
                            
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Дата заказа:</span>
                                    <span className={styles.infoValue}>{formatDate(order.orderDate)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Статус:</span>
                                    <span className={styles.infoValue}>{getStatusBadge(order.status)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Количество товаров:</span>
                                    <span className={styles.infoValue}>{order.totalQuantity} шт.</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Общая сумма:</span>
                                    <span className={styles.infoValue}>{order.totalAmount.toLocaleString()} ₽</span>
                                </div>
                                {order.deliveryAddress && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Адрес доставки:</span>
                                        <span className={styles.infoValue}>{order.deliveryAddress}</span>
                                    </div>
                                )}
                                {order.paymentMethod && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Способ оплаты:</span>
                                        <span className={styles.infoValue}>{order.paymentMethod}</span>
                                    </div>
                                )}
                                {order.comment && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Комментарий:</span>
                                        <span className={styles.infoValue}>{order.comment}</span>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Итоговая информация */}
                <Col lg={4}>
                    <Card className={styles.summaryCard}>
                        <Card.Body>
                            <h3 className={styles.sectionTitle}>💰 Итого</h3>
                            <div className={styles.summaryRow}>
                                <span>Товары ({order.totalQuantity} шт.):</span>
                                <span>{order.totalAmount.toLocaleString()} ₽</span>
                            </div>
                            <div className={styles.summaryDivider}></div>
                            <div className={styles.summaryTotal}>
                                <span>Итого к оплате:</span>
                                <span className={styles.totalAmount}>{order.totalAmount.toLocaleString()} ₽</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Товары в заказе */}
            <Row className="mt-4">
                <Col>
                    <Card className={styles.itemsCard}>
                        <Card.Body>
                            <h3 className={styles.sectionTitle}>🛍️ Товары в заказе</h3>
                            <div className={styles.itemsList}>
                                {order.items.map((item) => (
                                    <div key={item.id} className={styles.orderItem}>
                                        <div className={styles.itemImage}>
                                            <img
                                                src={item.imageProduct || '/placeholder.jpg'}
                                                alt={item.nameProducts}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemCategory}>{item.nameCategories}</div>
                                            <h4 className={styles.itemName}>{item.nameProducts}</h4>
                                            <div className={styles.itemBrand}>{item.nameManufacturers}</div>
                                            <div className={styles.itemArticle}>Арт: {item.partNumber}</div>
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <div className={styles.itemQuantity}>x {item.quantity}</div>
                                            <div className={styles.itemPrice}>{item.priceAtMoment} ₽</div>
                                            <div className={styles.itemTotal}>{item.totalPrice} ₽</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderDetailsPage;