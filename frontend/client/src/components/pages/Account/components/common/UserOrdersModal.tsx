import React, { useState, useEffect } from 'react';
import { Modal, Table, Badge, Button, Form } from 'react-bootstrap';

import { getOrderUser, OrderData, Orders } from '../../../../servicesApi/OrderApi';
// import { updateOrderStatus } from '../../../../servicesApi/OrderApi';

import styles from '../AdminPanel.module.css';

interface UserOrdersModalProps {
    show: boolean;
    onHide: () => void;
    userLogin: string;
    userName: string;
}

const statusOptions = [
    { value: 'В обработке', label: 'В обработке', color: 'warning' },
    { value: 'Собран', label: 'Собран', color: 'info' },
    { value: 'Выдан', label: 'Выдан', color: 'success' },
    { value: 'Отменен', label: 'Отменен', color: 'danger' }
];

const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return <Badge bg={option?.color || 'secondary'}>{status}</Badge>;
};

export const UserOrdersModal: React.FC<UserOrdersModalProps> = ({ show, onHide, userLogin, userName }) => {
    const [orderDataList, setOrderDataList] = useState<OrderData[]>([]);
    const [allOrders, setAllOrders] = useState<Orders[]>([]);
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

    useEffect(() => {
        if (show && userLogin) {
            loadOrders();
        }
    }, [show, userLogin]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await getOrderUser(userLogin);
            setOrderDataList(data);
            const extractedOrders: Orders[] = [];
            data.forEach(orderData => {
                if (orderData.orders && orderData.orders.length > 0) {
                    extractedOrders.push(...orderData.orders);
                }
            });
            setAllOrders(extractedOrders);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            setUpdatingStatus(orderId);
            //await updateOrderStatus(orderId, newStatus);
            alert('Статус заказа обновлен');
            await loadOrders();
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert('Не удалось обновить статус заказа');
        } finally {
            setUpdatingStatus(null);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Заказы пользователя {userName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center p-4">Загрузка заказов...</div>
                ) : allOrders.length === 0 ? (
                    <div className="text-center p-4">У пользователя нет заказов</div>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Дата</th>
                                <th>Статус</th>
                                <th>Товаров</th>
                                <th>Сумма</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allOrders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.nameOrder}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td>{order.orderItems?.length || 0}</td>
                                    <td>{order.orderItems?.reduce((sum, i) => sum + i.totalPrice, 0)} ₽</td>
                                    <td>
                                        <Form.Select
                                            size="sm"
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={updatingStatus === order.id}
                                            className={styles.statusSelect}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Form.Select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Закрыть</Button>
                <Button variant="primary" onClick={loadOrders}>🔄 Обновить</Button>
            </Modal.Footer>
        </Modal>
    );
};