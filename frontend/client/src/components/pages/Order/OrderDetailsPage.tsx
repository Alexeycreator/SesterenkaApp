import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { CurrentOrder, getCurrentOrderData } from '../../servicesApi/OrderApi';
import LoadingSpinner from '../../LoadingSpinner';

import styles from './OrderDetailsPage.module.css';

const OrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<CurrentOrder>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // получение данных конкретного заказа
    const fetchCurrentOrder = async () => {
        try {
            setLoading(true);
            const catalogData = await getCurrentOrderData(Number(id));
            setOrder(catalogData);
        }
        catch (err: any) {
            console.error('Ошибка загрузки страницы конкретного товара:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setError(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setError(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setError('Ошибка соединения с сервером');
            }
        }
        finally {
            setLoading(false);
        }
    };

    // хуки
    useEffect(() => {
        fetchCurrentOrder();
    }, []);

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

    const formatOrderDate = (dateString: string | Date | null | undefined) => {
        if (!dateString) {
            return 'Дата не указана';
        };

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Некорректная дата';
        };

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    if (loading) {
        return <LoadingSpinner />;
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
                <span className={styles.current}>Заказ #{order.nameOrder}</span>
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
                        <h1 className={styles.title}>Заказ #{order.nameOrder}</h1>
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
                                    <span className={styles.infoValue}>{formatOrderDate(order.dateOrder)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Статус:</span>
                                    <span className={styles.infoValue}>{getStatusBadge(order.status)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Количество товаров:</span>
                                    <span className={styles.infoValue}>{order.countProducts} шт.</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Общая сумма:</span>
                                    <span className={styles.infoValue}>{order.totalPriceOrder.toLocaleString()} ₽</span>
                                </div>
                                {order.address && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Адрес доставки:</span>
                                        <span className={styles.infoValue}>г. {order.address.city}, ул. {order.address.street}, д. {order.address.house}</span>
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
                                <span>Товары ({order.countProducts} шт.):</span>
                                <span>{order.totalPriceOrder.toLocaleString()} ₽</span>
                            </div>
                            <div className={styles.summaryDivider}></div>
                            <div className={styles.summaryTotal}>
                                <span>Итого к оплате:</span>
                                <span className={styles.totalAmount}>{order.totalPriceOrder.toLocaleString()} ₽</span>
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
                                {order.products.map((item) => (
                                    <div key={item.id} className={styles.orderItem}>
                                        <div className={styles.itemImage}>
                                            <img
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.nameProduct}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemCategory}>{item.categories}</div>
                                            <h4 className={styles.itemName}>{item.nameProduct}</h4>
                                            <div className={styles.itemBrand}>{item.manufacturers}</div>
                                            <div className={styles.itemArticle}>Арт: {item.partNumber}</div>
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <div className={styles.itemQuantity}>x {item.quantity}</div>
                                            <div className={styles.itemPrice}>{item.price} ₽</div>
                                            <div className={styles.itemTotal}>{item.totalPriceProduct} ₽</div>
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