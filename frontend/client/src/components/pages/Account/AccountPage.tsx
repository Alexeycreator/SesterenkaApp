import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Nav, Badge, Modal } from 'react-bootstrap';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';
import { getOrderUser, OrderData, OrderItems, Orders } from '../../servicesApi/OrderApi';
import { AddressOrder } from '../../servicesApi/AddressesApi';
import { changePassword } from '../../../service/IndexAuth';
import LoadingSpinner from '../../LoadingSpinner';

import styles from './AccountPage.module.css';

const AccountPage = () => {
    // для навигации и проверки пользователя
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated, logout, login, setUser } = useAuth();
    const { orderId } = useParams<{ orderId: string }>();

    // получаем параметры из URL
    const userId = searchParams.get('userId');
    const activeTab = searchParams.get('tab') || 'profile';

    // состояния измнения пользователя
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        firstName: currentUser?.firstName || '',
        secondName: currentUser?.secondName || '',
        surName: currentUser?.surName || '',
        email: currentUser?.email || '',
        phoneNumber: currentUser?.phoneNumber || '',
        birthday: currentUser?.birthday || ''
    });

    // состояния данных страницы
    const [accountData, setAccountData] = useState<OrderData[]>([]);
    const [addressesData, setAddressesData] = useState<AddressOrder[]>([]);
    const [ordersData, setOrdersData] = useState<Orders[]>([]);
    const [orderItemsData, setOrderItemsData] = useState<OrderItems[][]>([]);
    const [loadingAccountPage, setLoadingAccountPage] = useState(false);
    const [errorAccountPage, setErrorAccountPage] = useState<string | null>(null);

    // Поля для смены пароля
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Состояния для показа/скрытия паролей
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Ошибки
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const fetchOrders = async () => {
        try {
            setLoadingAccountPage(true);
            const orders = await getOrderUser(currentUser?.login || '');
            setAccountData(orders);
            if (orders != null) {
                fillingOrderUserData(orders);
            }
            else {
                console.error("Данные пустые!");
            }
        }
        catch (err: any) {
            console.error('Ошибка загрузки данных товара:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorAccountPage(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorAccountPage(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorAccountPage('Ошибка соединения с сервером');
            }
        }
        finally {
            setLoadingAccountPage(false);
        }
    };

    // хуки
    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (currentUser) {
            setEditedUser({
                firstName: currentUser.firstName || '',
                secondName: currentUser.secondName || '',
                surName: currentUser.surName || '',
                email: currentUser.email || '',
                phoneNumber: currentUser.phoneNumber || '',
                birthday: currentUser.birthday || ''
            });
        }
    }, [currentUser]);

    const fillingOrderUserData = (data: OrderData[]) => {
        data.forEach(ord => {
            const addresses = ord?.addresses;
            const orders = ord?.orders;
            const orderItems = ord?.orders.map(o => o.orderItems);
            setAddressesData(addresses);
            setOrdersData(orders);
            setOrderItemsData(orderItems);
        });
    };

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

    // Получение статуса заказа
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

    // Форматирование даты
    const formatBirthdayDate = (dateString: string | Date | null | undefined) => {
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

        return `${day}.${month}.${year}`;
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

    const birthdayCorrectDate = formatBirthdayDate(currentUser?.birthday);

    // Обработчик изменения полей
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    // Сохранение профиля
    const saveProfile = async () => {
        try {
            // TODO: отправить запрос на обновление данных
            // await updateUserProfile(editedUser);
            setIsEditing(false);
            alert('Данные успешно обновлены');
        } catch (error) {
            console.error('Ошибка обновления:', error);
            alert('Не удалось обновить данные');
        }
    };

    // Метод смены пароля
    const handleChangePassword = async () => {
        if (!currentUser?.id) {
            alert('Ошибка: пользователь не авторизован');
            return;
        }

        // Валидация
        if (!oldPassword) {
            setOldPasswordError('Введите текущий пароль');
            return;
        }

        if (!newPassword) {
            setNewPasswordError('Введите новый пароль');
            return;
        }

        if (newPassword.length < 6) {
            setNewPasswordError('Пароль должен быть не менее 6 символов');
            return;
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Пароли не совпадают');
            return;
        }

        try {
            setIsChanging(true);

            // Меняем пароль
            await changePassword(currentUser.id, oldPassword, newPassword);

            // Пробуем войти с новым паролем
            try {
                const loginResponse = await login(currentUser.login, newPassword);

                // Обновляем токен в localStorage
                localStorage.setItem('token', loginResponse.token);
                localStorage.setItem('user', JSON.stringify(loginResponse.user));

                // Обновляем состояние
                setUser(loginResponse.user);

                alert('Пароль успешно изменен');
                setShowPasswordModal(false);

                // Очищаем поля
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');

            } catch (loginError) {
                // Если не удалось войти, выходим из аккаунта
                alert('Пароль изменен, но требуется повторный вход');
                logout();
                navigate('/login');
            }

        } catch (error: any) {
            console.error('Ошибка:', error);

            if (error.statusCode === 401) {
                setOldPasswordError('Неверный текущий пароль');
            } else {
                alert(error.message || 'Не удалось изменить пароль');
            }
        } finally {
            setIsChanging(false);
        }
    };

    // Проверка авторизации
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    };

    if (loadingAccountPage) {
        <LoadingSpinner />
    };

    // Проверка прав доступа
    if (userId && currentUser && parseInt(userId) !== currentUser.id) {
        return <Navigate to={`/personalAccount?userId=${currentUser.id}&tab=${activeTab}`} replace />;
    };

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <h1 className={styles.title}>Личный кабинет</h1>
                    <p className={styles.subtitle}>
                        Добро пожаловать, {currentUser?.secondName} {currentUser?.firstName}!
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
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Имя</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="firstName"
                                                        value={editedUser.firstName}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Фамилия</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="secondName"
                                                        value={editedUser.secondName}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Отчество</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="surName"
                                                        value={editedUser.surName}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={editedUser.email}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Телефон</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phoneNumber"
                                                        value={editedUser.phoneNumber}
                                                        onChange={handleInputChange}
                                                        className={styles.formInput}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={styles.formLabel}>Дата рождения</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="birthday"
                                                        value={editedUser.birthday?.split('T')[0] || ''}
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
                                            <span className={styles.infoLabel}>ФИО:</span>
                                            <span className={styles.infoValue}>
                                                {currentUser?.secondName} {currentUser?.firstName} {currentUser?.surName}
                                            </span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Email:</span>
                                            <span className={styles.infoValue}>{currentUser?.email}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Телефон:</span>
                                            <span className={styles.infoValue}>{currentUser?.phoneNumber}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Дата рождения:</span>
                                            <span className={styles.infoValue}>{birthdayCorrectDate}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>{`Всего заказов\n ${accountData.map(a => a.countOrder)}`}</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statLabel}>{`Всего потрачено\n ${accountData.map(a => a.totalPrice)} ₽`}</div>
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
                                {loadingAccountPage ? (
                                    <div className={styles.loadingOrders}>Загрузка заказов...</div>
                                ) : accountData.length === 0 ? (
                                    <div className={styles.emptyOrders}>
                                        <p>У вас пока нет заказов</p>
                                        <Button onClick={() => navigate('/catalog')} className={styles.shopButton}>
                                            Перейти в каталог
                                        </Button>
                                    </div>
                                ) : (
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
                                                        <span>{`Товаров: ${order.orderItems.length}`}</span>
                                                        <span>{`Сумма: ${order.orderItems.reduce((sum, oi) => sum + oi.totalPrice, 0)} ₽`}</span>
                                                    </div>
                                                    <div className={styles.orderAddress}>
                                                        Адрес доставки:
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
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {/* Настройки */}
                    {activeTab === 'settings' && (
                        <Card className={styles.contentCard}>
                            <Card.Body>
                                <h2 className={styles.sectionTitle}>Настройки аккаунта</h2>
                                <div className={styles.settingsSection}>
                                    <h3 className={styles.settingsSubtitle}>Безопасность</h3>
                                    <Button
                                        className={styles.changePasswordButton}
                                        onClick={() => setShowPasswordModal(true)}
                                    >
                                        Изменить пароль
                                    </Button>
                                </div>

                                {/* Модальное окно смены пароля */}
                                <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Изменение пароля</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form>
                                            {/* Старый пароль */}
                                            <Form.Group className="mb-3">
                                                <Form.Label>Текущий пароль *</Form.Label>
                                                <div className={styles.passwordInputWrapper}>
                                                    <Form.Control
                                                        type={showOldPassword ? 'text' : 'password'}
                                                        value={oldPassword}
                                                        onChange={(e) => {
                                                            setOldPassword(e.target.value);
                                                            setOldPasswordError('');
                                                        }}
                                                        placeholder="Введите текущий пароль"
                                                        isInvalid={!!oldPasswordError}
                                                        className={styles.passwordInput}
                                                    />
                                                    <Button
                                                        variant="link"
                                                        className={styles.passwordToggle}
                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                    >
                                                        {showOldPassword ? '🙈' : '👁️'}
                                                    </Button>
                                                </div>
                                                <Form.Control.Feedback type="invalid">
                                                    {oldPasswordError}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            {/* Новый пароль */}
                                            <Form.Group className="mb-3">
                                                <Form.Label>Новый пароль *</Form.Label>
                                                <div className={styles.passwordInputWrapper}>
                                                    <Form.Control
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onChange={(e) => {
                                                            setNewPassword(e.target.value);
                                                            setNewPasswordError('');
                                                        }}
                                                        placeholder="Введите новый пароль"
                                                        isInvalid={!!newPasswordError}
                                                        className={styles.passwordInput}
                                                    />
                                                    <Button
                                                        variant="link"
                                                        className={styles.passwordToggle}
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? '🙈' : '👁️'}
                                                    </Button>
                                                </div>
                                                <Form.Control.Feedback type="invalid">
                                                    {newPasswordError}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">
                                                    Пароль должен содержать не менее 6 символов
                                                </Form.Text>
                                            </Form.Group>

                                            {/* Подтверждение пароля */}
                                            <Form.Group className="mb-3">
                                                <Form.Label>Подтверждение пароля *</Form.Label>
                                                <div className={styles.passwordInputWrapper}>
                                                    <Form.Control
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={confirmPassword}
                                                        onChange={(e) => {
                                                            setConfirmPassword(e.target.value);
                                                            setConfirmPasswordError('');
                                                        }}
                                                        placeholder="Повторите новый пароль"
                                                        isInvalid={!!confirmPasswordError}
                                                        className={styles.passwordInput}
                                                    />
                                                    <Button
                                                        variant="link"
                                                        className={styles.passwordToggle}
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? '🙈' : '👁️'}
                                                    </Button>
                                                </div>
                                                <Form.Control.Feedback type="invalid">
                                                    {confirmPasswordError}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                                            Отмена
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleChangePassword}
                                            disabled={isChanging}
                                        >
                                            {isChanging ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

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