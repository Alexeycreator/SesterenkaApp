import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Row, Col, Table, Badge, Modal, Alert, Form, InputGroup } from 'react-bootstrap';
import { getUsers, User, updateRoleUser, deleteUser } from '../../../servicesApi/UsersApi';
import { UserOrdersModal } from './common/UserOrdersModal';
import { ProductManagement } from './common/ProductManagement';
import { CategoryManagement } from './common/CategoryManagement';
import { ManufacturerManagement } from './common/ManufacturerManagement';
import { StockManagement } from './common/StockManagement';
import { AddressManagement } from './common/AddressManagement';
import styles from './AdminPanel.module.css';

interface AdminPanelProps {
    onRefresh?: () => void;
    userRole?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRefresh, userRole }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Состояния для модальных окон
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showManufacturerModal, setShowManufacturerModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
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

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await updateRoleUser(userId, newRole);
            await loadUsers();
            alert('Роль пользователя обновлена');
        } catch (error) {
            console.error('Ошибка обновления роли:', error);
            alert('Не удалось обновить роль');
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser(selectedUser.id);
            await loadUsers();
            alert('Пользователь успешно удален');
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Не удалось удалить пользователя');
        } finally {
            setShowDeleteConfirm(false);
            setSelectedUser(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className={styles.roleAdmin}>Администратор</Badge>;
            case 'employee':
                return <Badge className={styles.roleEmployee}>Сотрудник</Badge>;
            default:
                return <Badge className={styles.roleUser}>Пользователь</Badge>;
        }
    };

    const clearSearch = () => setSearchTerm('');

    return (
        <Card className={styles.contentCard}>
            <Card.Body>
                <h2 className={styles.sectionTitle}>👑 Администрирование</h2>

                {/* Панель управления каталогом */}
                <h3 className={styles.sectionSubtitle}>Управление каталогом</h3>
                <Row className="g-4 mb-5">
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowProductModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>📦 Товары</h3>
                                <p>Добавление, редактирование и удаление товаров</p>
                                <Button className={styles.cardLink}>Управление товарами →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowCategoryModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>📂 Категории</h3>
                                <p>Управление категориями товаров</p>
                                <Button className={styles.cardLink}>Управление категориями →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowManufacturerModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>🏷️ Бренды</h3>
                                <p>Управление производителями</p>
                                <Button className={styles.cardLink}>Управление брендами →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowStockModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>🏪 Склады</h3>
                                <p>Управление остатками товаров</p>
                                <Button className={styles.cardLink}>Управление складами →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={styles.adminCard} onClick={() => setShowAddressModal(true)}>
                            <Card.Body className={styles.cardBody}>
                                <h3>📍 Адреса</h3>
                                <p>Управление адресами магазинов</p>
                                <Button className={styles.cardLink}>Управление адресами →</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Управление пользователями с поиском */}
                <h3 className={styles.sectionSubtitle}>Управление пользователями</h3>

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
                                <th>ID</th>
                                <th>ФИО</th>
                                <th>Логин</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Роль</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center">Загрузка...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={7} className="text-center text-muted">
                                    {searchTerm ? 'Пользователи не найдены' : 'Нет пользователей'}
                                </td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>
                                            <strong>{user.secondName} {user.firstName} {user.surName}</strong>
                                        </td>
                                        <td>{user.login}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phoneNumber}</td>
                                        <td>{getRoleBadge(user.role)}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={styles.roleSelect}
                                            >
                                                <option value="user">Пользователь</option>
                                                <option value="employee">Сотрудник</option>
                                                <option value="admin">Администратор</option>
                                            </select>
                                            <Button
                                                className={styles.viewOrdersBtn}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowOrdersModal(true);
                                                }}
                                            >
                                                📋 Заказы
                                            </Button>
                                            <Button
                                                className={styles.deleteUserBtn}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowDeleteConfirm(true);
                                                }}
                                            >
                                                🗑️ Удалить
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

                {/* Модальное окно подтверждения удаления */}
                <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Удаление пользователя</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Вы действительно хотите удалить пользователя <strong>{selectedUser?.secondName} {selectedUser?.firstName}</strong>?</p>
                        <Alert variant="danger">⚠️ Это действие необратимо. Все данные пользователя будут удалены.</Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Отмена</Button>
                        <Button variant="danger" onClick={handleDeleteUser}>Удалить</Button>
                    </Modal.Footer>
                </Modal>
            </Card.Body>
        </Card>
    );
};