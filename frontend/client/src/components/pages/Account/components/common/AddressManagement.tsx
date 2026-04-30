import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { getAddresses, Address, updateAddress, deleteAddress } from '../../../../servicesApi/AddressesApi';
import styles from '../AdminPanel.module.css';
import { useAuth } from '../../../../../contexts/AuthContext';

interface AddressManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const AddressManagement: React.FC<AddressManagementProps> = ({ show, onHide, onRefresh }) => {
    const { user: currentUser, role: userRole, isAuthenticated } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        region: '',
        city: '',
        street: '',
        house: '',
        isShop: false
    });

    const normalizedRole = userRole?.toLowerCase();
    const isAdmin = normalizedRole === 'admin';
    const isEmployee = normalizedRole === 'employee';
    const canDelete = isAdmin;
    const canEdit = isAdmin || isEmployee;
    const canAdd = isAdmin || isEmployee;

    useEffect(() => {
        if (show) {
            loadAddresses();
        } else {
            // При закрытии модального окна сбрасываем все состояния
            resetAllStates();
        }
    }, [show]);

    const resetAllStates = () => {
        setFormData({
            region: '',
            city: '',
            street: '',
            house: '',
            isShop: false
        });
        setEditingAddress(null);
        setSearchTerm('');
        setAddresses([]);
    };

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const data = await getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Ошибка загрузки адресов:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAddresses = useMemo(() => {
        if (!searchTerm.trim()) return addresses;
        const term = searchTerm.toLowerCase().trim();
        return addresses.filter(addr =>
            String(addr.city).toLowerCase().includes(term) ||
            String(addr.street).toLowerCase().includes(term)
        );
    }, [addresses, searchTerm]);

    const handleSave = async () => {
        if (!formData.city || !formData.street) {
            alert('Заполните обязательные поля (город и улица)');
            return;
        }

        if (!canAdd) {
            alert('У вас нет прав для добавления/редактирования адресов');
            return;
        }

        if (!currentUser?.id) {
            alert('Ошибка: пользователь не авторизован');
            return;
        }

        setSaving(true);
        try {
            const addressData: any = {
                city: formData.city,
                street: formData.street
            };

            if (formData.region && formData.region.trim()) {
                addressData.region = formData.region;
            }
            if (formData.house && formData.house.trim()) {
                addressData.house = formData.house;
            }

            if (isAdmin) {
                addressData.isShop = formData.isShop;
            }

            console.log('Отправляемые данные:', addressData);
            console.log('Режим:', editingAddress ? 'Редактирование' : 'Создание');
            console.log('Пользователь:', currentUser.login, 'Роль:', userRole);

            if (editingAddress) {
                await updateAddress(editingAddress.id, addressData, currentUser.id);
                alert('Адрес успешно обновлен');
            } else {
                //await createAddress(addressData, currentUser.id);
                alert('Адрес успешно добавлен');
            }
            resetForm();
            await loadAddresses();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('Ошибка сохранения:', error);
            alert(error.message || 'Не удалось сохранить адрес');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            region: '',
            city: '',
            street: '',
            house: '',
            isShop: false
        });
        setEditingAddress(null);
    };

    const clearForm = () => {
        setFormData({
            region: '',
            city: '',
            street: '',
            house: '',
            isShop: false
        });
        if (editingAddress) {
            setEditingAddress(null);
        }
        alert('Форма очищена');
    };

    const handleEdit = (address: Address) => {
        if (!canEdit) {
            alert('У вас нет прав для редактирования адресов');
            return;
        }
        setEditingAddress(address);
        setFormData({
            region: address.region ? String(address.region) : '',
            city: String(address.city),
            street: String(address.street),
            house: address.house ? String(address.house) : '',
            isShop: Boolean(address.isShop)
        });
    };

    const handleDelete = async (id: number) => {
        if (!canDelete) {
            alert('Только администратор может удалять адреса');
            return;
        }

        if (!currentUser?.id) {
            alert('Ошибка: пользователь не авторизован');
            return;
        }

        if (window.confirm('Удалить адрес?')) {
            setSaving(true);
            try {
                await deleteAddress(id);
                alert('Адрес удален');
                await loadAddresses();
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Не удалось удалить адрес');
            } finally {
                setSaving(false);
            }
        }
    };

    const clearSearch = () => setSearchTerm('');

    const handleClose = () => {
        resetAllStates();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Управление адресами магазинов</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={6}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Существующие адреса</h5>
                            <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={loadAddresses}
                                disabled={loading}
                            >
                                🔄 Обновить
                            </Button>
                        </div>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Поиск по городу, улице..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <Button variant="outline-secondary" onClick={clearSearch}>
                                    ✕
                                </Button>
                            )}
                        </InputGroup>

                        <div className={styles.itemsList}>
                            {loading ? (
                                <p className="text-center">Загрузка...</p>
                            ) : filteredAddresses.length === 0 ? (
                                <p className="text-center text-muted">
                                    {searchTerm ? 'Адреса не найдены' : 'Нет адресов'}
                                </p>
                            ) : (
                                <>
                                    <div className={styles.searchInfo}>
                                        Найдено: {filteredAddresses.length} из {addresses.length}
                                    </div>
                                    {filteredAddresses.map(addr => (
                                        <div key={addr.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}>
                                                <strong>{String(addr.city)}, {String(addr.street)} {addr.house ? String(addr.house) : ''}</strong>
                                                {addr.isShop && (
                                                    <span className={styles.shopBadge}>🏪 Магазин</span>
                                                )}
                                            </div>
                                            <div className={styles.itemActions}>
                                                {canEdit && (
                                                    <Button
                                                        size="sm"
                                                        className={styles.editBtn}
                                                        onClick={() => handleEdit(addr)}
                                                        disabled={saving}
                                                    >
                                                        ✎
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        size="sm"
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDelete(addr.id)}
                                                        disabled={saving}
                                                    >
                                                        ✕
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>
                    {(canAdd || canEdit) && (
                        <Col md={6}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>{editingAddress ? 'Редактирование адреса' : 'Добавление адреса'}</h5>
                                {!editingAddress && (
                                    <Button size="sm" variant="outline-secondary" onClick={clearForm}>
                                        🗑️ Очистить
                                    </Button>
                                )}
                            </div>
                            <Form>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Город *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="Введите город"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Улица *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.street}
                                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                placeholder="Введите улицу"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Дом</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.house}
                                                onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                                                placeholder="Номер дома"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {isAdmin && (
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Тип адреса</Form.Label>
                                                <div className={styles.checkboxGroup}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        id="isShop"
                                                        label="🏪 Это магазин (пункт выдачи)"
                                                        checked={formData.isShop}
                                                        onChange={(e) => setFormData({ ...formData, isShop: e.target.checked })}
                                                        disabled={saving}
                                                    />
                                                </div>
                                                <small className="text-muted">
                                                    Отметьте, если этот адрес является магазином/пунктом выдачи
                                                </small>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}

                                <div className="d-flex gap-2 mt-3">
                                    {!editingAddress && (
                                        <Button variant="secondary" onClick={clearForm} className="flex-grow-1" disabled={saving}>
                                            🗑️ Очистить форму
                                        </Button>
                                    )}
                                    <Button
                                        className={styles.saveBtn}
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{ flex: editingAddress ? 1 : 2 }}
                                    >
                                        {saving ? 'Сохранение...' : (editingAddress ? 'Сохранить изменения' : '➕ Добавить адрес')}
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                    )}
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={saving}>Закрыть</Button>
            </Modal.Footer>
        </Modal>
    );
};