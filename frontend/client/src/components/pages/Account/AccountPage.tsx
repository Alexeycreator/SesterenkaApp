import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';
import { getOrderUser, OrderData } from '../../servicesApi/OrderApi';
import LoadingSpinner from '../../LoadingSpinner';
import { ProfileTab } from './components/ProfileTab';
import { OrdersTab } from './components/OrdersTab';
import { SettingsTab } from './components/SettingsTab';
import { EmployeePanel } from './components/EmployeePanel';
import { AdminPanel } from './components/AdminPanel';
import { useAccountData } from './hooks/useAccountData';

import styles from './AccountPage.module.css';

const AccountPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated, role: userRole } = useAuth();

    // Получаем параметры из URL
    const userId = searchParams.get('userId');
    const activeTab = searchParams.get('tab') || 'profile';

    const { ordersData, orderItemsData, loading, error, fetchOrders } = useAccountData(currentUser?.login);

    // Обновление вкладки с сохранением userId
    const handleTabChange = (tab: string) => {
        const params: Record<string, string> = {};
        if (userId) {
            params.userId = userId;
        }
        if (tab !== 'profile') {
            params.tab = tab;
        }
        setSearchParams(params);
    };

    // Проверка авторизации
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    // Проверка прав доступа
    if (userId && currentUser && parseInt(userId) !== currentUser.id && userRole !== 'admin') {
        return <Navigate to={`/personalAccount?userId=${currentUser.id}&tab=${activeTab}`} replace />;
    }

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <h1 className={styles.title}>Личный кабинет</h1>
                    <p className={styles.subtitle}>
                        Добро пожаловать, {currentUser?.secondName} {currentUser?.firstName}!
                        {userRole && <span className={styles.roleBadge}> ({userRole === 'admin' ? 'Администратор' : userRole === 'employee' ? 'Сотрудник' : 'Пользователь'})</span>}
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
                                onClick={() => handleTabChange('profile')}
                                className={styles.tabLink}
                            >
                                👤 Профиль
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'orders'}
                                onClick={() => handleTabChange('orders')}
                                className={styles.tabLink}
                            >
                                📦 Заказы
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'settings'}
                                onClick={() => handleTabChange('settings')}
                                className={styles.tabLink}
                            >
                                ⚙️ Настройки
                            </Nav.Link>
                        </Nav.Item>
                        {userRole === 'employee' && (
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'employee'}
                                    onClick={() => handleTabChange('employee')}
                                    className={styles.tabLink}
                                >
                                    🛠️ Управление
                                </Nav.Link>
                            </Nav.Item>
                        )}
                        {userRole === 'admin' && (
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'admin'}
                                    onClick={() => handleTabChange('admin')}
                                    className={styles.tabLink}
                                >
                                    👑 Администрирование
                                </Nav.Link>
                            </Nav.Item>
                        )}
                    </Nav>
                </Col>
            </Row>

            {/* Контент вкладок - явный рендеринг */}
            <Row>
                <Col lg={12}>
                    {activeTab === 'profile' && (
                        <ProfileTab currentUser={currentUser} onRefresh={fetchOrders} />
                    )}
                    {activeTab === 'orders' && (
                        <OrdersTab
                            ordersData={ordersData}
                            orderItemsData={orderItemsData}
                            loading={loading}
                            onRefresh={fetchOrders}
                        />
                    )}
                    {activeTab === 'settings' && (
                        <SettingsTab currentUser={currentUser} onRefresh={fetchOrders} />
                    )}
                    {activeTab === 'employee' && userRole === 'employee' && (
                        <EmployeePanel currentUser={currentUser} onRefresh={fetchOrders} userRole={currentUser?.role || ''} />
                    )}
                    {activeTab === 'admin' && userRole === 'admin' && (
                        <AdminPanel onRefresh={fetchOrders} userRole={currentUser?.role || ''} />
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export { AccountPage };