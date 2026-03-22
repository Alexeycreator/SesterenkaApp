import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Nav, Badge, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './AccountPage.module.css';

interface UserData {
    firstName: string;
    secondName: string;
    email: string;
    phone: string;
    birthDate: string;
    registeredSince: string;
    totalOrders: number;
    totalSpent: number;
}

interface Order {
    id: string;
    date: string;
    status: 'completed' | 'processing' | 'cancelled' | 'delivered';
    itemsCount: number;
    total: number;
    deliveryAddress: string;
}

const AccountPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    const userData: UserData = {
        firstName: 'Иван',
        secondName: 'Петров',
        email: 'ivan.petrov@example.com',
        phone: '+7 (901) 339-95-22',
        birthDate: '15.03.1990',
        registeredSince: '10 января 2024',
        totalOrders: 12,
        totalSpent: 45680
    };

    const [editedData, setEditedData] = useState(userData);

    const orders: Order[] = [
        {
            id: 'ORD-2024-001',
            date: '15.03.2024',
            status: 'delivered',
            itemsCount: 3,
            total: 2340,
            deliveryAddress: 'Москва, ул. Пальмовая, 13'
        },
        {
            id: 'ORD-2024-002',
            date: '10.03.2024',
            status: 'processing',
            itemsCount: 2,
            total: 1780,
            deliveryAddress: 'Москва, ул. Пальмовая, 13'
        },
        {
            id: 'ORD-2024-003',
            date: '05.03.2024',
            status: 'completed',
            itemsCount: 5,
            total: 5670,
            deliveryAddress: 'Москва, ул. Пальмовая, 13'
        },
        {
            id: 'ORD-2024-004',
            date: '28.02.2024',
            status: 'cancelled',
            itemsCount: 1,
            total: 890,
            deliveryAddress: 'Москва, ул. Пальмовая, 13'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className={styles.statusCompleted}>Завершен</Badge>;
            case 'processing': return <Badge className={styles.statusProcessing}>В обработке</Badge>;
            case 'delivered': return <Badge className={styles.statusDelivered}>Доставлен</Badge>;
            case 'cancelled': return <Badge className={styles.statusCancelled}>Отменен</Badge>;
            default: return null;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const saveProfile = () => {
        // Здесь будет логика сохранения
        setIsEditing(false);
    };

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <h1 className={styles.title}>Личный кабинет</h1>
                    <p className={styles.subtitle}>
                        Добро пожаловать, {userData.secondName} {userData.firstName}!
                    </p>
                </Col>
            </Row>

            {/* Навигация по вкладкам */}
            <Row className="mb-4">
                <Col>
                    <Nav variant="tabs" className={styles.accountTabs}>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                                className={styles.tabLink}
                            >
                                👤 Профиль
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'orders'}
                                onClick={() => setActiveTab('orders')}
                                className={styles.tabLink}
                            >
                                📦 Заказы
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'addresses'}
                                onClick={() => setActiveTab('addresses')}
                                className={styles.tabLink}
                            >
                                🏠 Адреса доставки
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'settings'}
                                onClick={() => setActiveTab('settings')}
                                className={styles.tabLink}
                            >
                                ⚙️ Настройки
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>

            {/* Контент вкладок */}
            <Row>
                <Col lg={12}>
                    {/* Профиль */}
                    {activeTab === 'profile' && (
                        <Card className={styles.contentCard}>
                            <Card.Body>
                                <div className={styles.profileHeader}>
                                    <h2 className={styles.sectionTitle}>Личные данные</h2>
                                    <Button
                                        className={styles.editButton}
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        {isEditing ? 'Отмена' : '✎ Редактировать'}
                                    </Button>
                                </div>

                                {isEditing ? (
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Имя</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="firstName"
                                                        value={editedData.firstName}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Фамилия</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="secondName"
                                                        value={editedData.secondName}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={editedData.email}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Телефон</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={editedData.phone}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Button
                                            className={styles.saveButton}
                                            onClick={saveProfile}
                                        >
                                            Сохранить изменения
                                        </Button>
                                    </Form>
                                ) : (
                                    <div className={styles.profileInfo}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Имя:</span>
                                            <span className={styles.infoValue}>{userData.firstName} {userData.secondName}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Email:</span>
                                            <span className={styles.infoValue}>{userData.email}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Телефон:</span>
                                            <span className={styles.infoValue}>{userData.phone}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Дата рождения:</span>
                                            <span className={styles.infoValue}>{userData.birthDate}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Зарегистрирован:</span>
                                            <span className={styles.infoValue}>{userData.registeredSince}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statValue}>{userData.totalOrders}</div>
                                        <div className={styles.statLabel}>Всего заказов</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statValue}>{userData.totalSpent} ₽</div>
                                        <div className={styles.statLabel}>Всего потрачено</div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Заказы */}
                    {activeTab === 'orders' && (
                        <Card className={styles.contentCard}>
                            <Card.Body>
                                <h2 className={styles.sectionTitle}>История заказов</h2>
                                <div className={styles.ordersList}>
                                    {orders.map((order) => (
                                        <div key={order.id} className={styles.orderItem}>
                                            <div className={styles.orderHeader}>
                                                <span className={styles.orderId}>Заказ {order.id}</span>
                                                <span className={styles.orderDate}>{order.date}</span>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <div className={styles.orderDetails}>
                                                <div className={styles.orderInfo}>
                                                    <span>Товаров: {order.itemsCount}</span>
                                                    <span>Сумма: {order.total} ₽</span>
                                                </div>
                                                <div className={styles.orderAddress}>
                                                    Адрес доставки: {order.deliveryAddress}
                                                </div>
                                            </div>
                                            <Button
                                                variant="link"
                                                className={styles.orderDetailsBtn}
                                            >
                                                Подробнее →
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Адреса доставки */}
                    {activeTab === 'addresses' && (
                        <Card className={styles.contentCard}>
                            <Card.Body>
                                <div className={styles.addressesHeader}>
                                    <h2 className={styles.sectionTitle}>Адреса доставки</h2>
                                    <Button className={styles.addAddressButton}>
                                        + Добавить адрес
                                    </Button>
                                </div>
                                <div className={styles.addressesList}>
                                    <div className={styles.addressItem}>
                                        <div className={styles.addressMain}>
                                            <div className={styles.addressType}>Основной адрес</div>
                                            <div className={styles.addressText}>
                                                Москва, ул. Пальмовая, д. 13, кв. 42
                                            </div>
                                        </div>
                                        <div className={styles.addressActions}>
                                            <Button className={styles.addressEditBtn}>✎</Button>
                                            <Button className={styles.addressDeleteBtn}>✕</Button>
                                        </div>
                                    </div>
                                    <div className={styles.addressItem}>
                                        <div className={styles.addressMain}>
                                            <div className={styles.addressType}>Рабочий адрес</div>
                                            <div className={styles.addressText}>
                                                Москва, ул. Тверская, д. 15, офис 304
                                            </div>
                                        </div>
                                        <div className={styles.addressActions}>
                                            <Button className={styles.addressEditBtn}>✎</Button>
                                            <Button className={styles.addressDeleteBtn}>✕</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Настройки */}
                    {activeTab === 'settings' && (
                        <Card className={styles.contentCard}>
                            <Card.Body>
                                <h2 className={styles.sectionTitle}>Настройки аккаунта</h2>

                                <div className={styles.settingsSection}>
                                    <h3 className={styles.settingsSubtitle}>Уведомления</h3>
                                    <Form>
                                        <Form.Check
                                            type="checkbox"
                                            label="Получать уведомления о статусе заказа"
                                            defaultChecked
                                            className={styles.settingCheckbox}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Получать новости и акции"
                                            defaultChecked
                                            className={styles.settingCheckbox}
                                        />
                                    </Form>
                                </div>

                                <div className={styles.settingsSection}>
                                    <h3 className={styles.settingsSubtitle}>Безопасность</h3>
                                    <Button className={styles.changePasswordButton}>
                                        Изменить пароль
                                    </Button>
                                </div>

                                <div className={styles.settingsSection}>
                                    <h3 className={styles.settingsSubtitle}>Удаление аккаунта</h3>
                                    <p className={styles.deleteWarning}>
                                        После удаления аккаунта все ваши данные будут безвозвратно удалены
                                    </p>
                                    <Button className={styles.deleteAccountButton}>
                                        Удалить аккаунт
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export { AccountPage };