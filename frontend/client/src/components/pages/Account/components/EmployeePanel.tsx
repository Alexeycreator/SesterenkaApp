import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Row, Col, Table, Form, InputGroup, Alert } from 'react-bootstrap';

import { getUsers, User } from '../../../servicesApi/UsersApi';
import { UserOrdersModal } from './common/UserOrdersModal';
import { ProductManagement } from './common/ProductManagement';
import { CategoryManagement } from './common/CategoryManagement';
import { ManufacturerManagement } from './common/ManufacturerManagement';
import { StockManagement } from './common/StockManagement';
import { AddressManagement } from './common/AddressManagement';

import styles from './EmployeePanel.module.css';

interface EmployeePanelProps {
    currentUser?: any;
    onRefresh?: () => void;
    userRole: string;
}

export const EmployeePanel: React.FC<EmployeePanelProps> = ({ currentUser, onRefresh }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showManufacturerModal, setShowManufacturerModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const showError = (message: string) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 5000);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const data = await getUsers();
            setUsers(data);
        } catch (error: any) {
            console.error('Ошибка загрузки пользователей:', error);
            const msg = error.serverMessage || error.message || 'Не удалось загрузить список пользователей';
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Фильтрация пользователей по ФИО
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const term = searchTerm.toLowerCase().trim();
        return users.filter(user =>
            user.secondName?.toLowerCase().includes(term) ||
            user.firstName?.toLowerCase().includes(term) ||
            user.surName?.toLowerCase().includes(term) ||
            `${user.secondName} ${user.firstName} ${user.surName}`.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    const clearSearch = () => setSearchTerm('');

    return (
        <Card className={styles.contentCard}>
            <Card.Body>
                <h2 className={styles.sectionTitle}>🛠️ Панель управления сотрудника</h2>

                {/* Уведомление об ошибке */}
                {errorMessage && (
                    <Alert variant="danger" className={styles.errorAlert} onClose={() => setErrorMessage(null)} dismissible>
                        <Alert.Heading>❌ Ошибка!</Alert.Heading>
                        <p>{errorMessage}</p>
                    </Alert>
                )}

                {/* Панель управления каталогом */}
                <h3 className={styles.sectionSubtitle}>Управление каталогом</h3>
                <Row className="g-4 mb-5">
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowProductModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>📦 Товары</h3>
                                <p>Добавление, редактирование товаров</p>
                                <Button className={styles.cardLink}>Управление товарами →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowCategoryModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>📂 Категории</h3>
                                <p>Управление категориями</p>
                                <Button className={styles.cardLink}>Управление категориями →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowManufacturerModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>🏷️ Бренды</h3>
                                <p>Управление брендами</p>
                                <Button className={styles.cardLink}>Управление брендами →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowStockModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>🏪 Склады</h3>
                                <p>Управление остатками</p>
                                <Button className={styles.cardLink}>Управление складами →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowAddressModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>📍 Адреса</h3>
                                <p>Управление адресами</p>
                                <Button className={styles.cardLink}>Управление адресами →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Просмотр пользователей с поиском */}
                <h3 className={styles.sectionSubtitle}>Пользователи</h3>

                {/* Поисковая строка */}
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="🔍 Поиск по фамилии, имени или отчеству..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchTerm && (
                        <Button variant="outline-secondary" onClick={clearSearch} className={styles.clearSearchBtn}>
                            ✕
                        </Button>
                    )}
                </InputGroup>

                {/* Информация о результатах поиска */}
                {searchTerm && (
                    <div className={styles.searchInfo}>
                        Найдено: {filteredUsers.length} из {users.length}
                    </div>
                )}

                <div className={styles.usersTable}>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ФИО</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center">Загрузка...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="text-center text-muted">
                                    {searchTerm ? 'Пользователи не найдены' : 'Нет пользователей'}
                                </td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <strong>{user.secondName} {user.firstName} {user.surName}</strong>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phoneNumber}</td>
                                        <td>
                                            <Button
                                                className={styles.viewOrdersBtn}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowOrdersModal(true);
                                                }}
                                            >
                                                📋 Заказы (смена статуса)
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>

                {/* Модальные окна */}
                <ProductManagement show={showProductModal} onHide={() => setShowProductModal(false)} onRefresh={onRefresh} />
                <CategoryManagement show={showCategoryModal} onHide={() => setShowCategoryModal(false)} onRefresh={onRefresh} />
                <ManufacturerManagement show={showManufacturerModal} onHide={() => setShowManufacturerModal(false)} onRefresh={onRefresh} />
                <StockManagement show={showStockModal} onHide={() => setShowStockModal(false)} onRefresh={onRefresh} />
                <AddressManagement show={showAddressModal} onHide={() => setShowAddressModal(false)} onRefresh={onRefresh} />

                <UserOrdersModal
                    show={showOrdersModal}
                    onHide={() => setShowOrdersModal(false)}
                    userLogin={selectedUser?.login || ''}
                    userName={`${selectedUser?.secondName} ${selectedUser?.firstName}`}
                />
            </Card.Body>
        </Card>
    );
};