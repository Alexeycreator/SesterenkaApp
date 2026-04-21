import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { Orders, OrderItems } from '../../../servicesApi/OrderApi';

import styles from './OrdersTab.module.css';

interface OrdersTabProps {
    ordersData: Orders[];
    orderItemsData: OrderItems[][];
    loading?: boolean;
    onRefresh?: () => void;
}

const formatOrderDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Некорректная дата';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'В корзине':
            return <Badge className={styles.statusBasket}>🛒 {status}</Badge>;
        case 'В обработке':
            return <Badge className={styles.statusProcessing}>⚙️ {status}</Badge>;
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

export const OrdersTab: React.FC<OrdersTabProps> = ({ ordersData, loading }) => {
    const navigate = useNavigate();

    if (loading) {
        return <div className={styles.loadingOrders}>Загрузка заказов...</div>;
    }

    if (!ordersData || ordersData.length === 0) {
        return (
            <Card className={styles.contentCard}>
                <Card.Body>
                    <div className={styles.emptyOrders}>
                        <p>У вас пока нет заказов</p>
                        <Button onClick={() => navigate('/catalog')} className={styles.shopButton}>
                            Перейти в каталог
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className={styles.contentCard}>
            <Card.Body>
                <h2 className={styles.sectionTitle}>История заказов</h2>
                <div className={styles.ordersList}>
                    {ordersData.map((order) => (
                        <div key={order.id} className={styles.orderItem}>
                            <div className={styles.orderHeader}>
                                <span className={styles.orderId}>Заказ {order.nameOrder}</span>
                                <span className={styles.orderDate}>{formatOrderDate(order.orderDate)}</span>
                                {getStatusBadge(order.status)}
                            </div>
                            <div className={styles.orderDetails}>
                                <div className={styles.orderInfo}>
                                    <span>Товаров: {order.orderItems?.length || 0}</span>
                                    <span>Сумма: {order.orderItems?.reduce((sum, oi) => sum + oi.totalPrice, 0) || 0} ₽</span>
                                </div>
                            </div>
                            <Button
                                variant="link"
                                className={styles.orderDetailsBtn}
                                onClick={() => navigate(`/order/${order.id}`)}
                            >
                                Подробнее →
                            </Button>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
};