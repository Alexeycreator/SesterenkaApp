import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { getAddresses, Address } from '../../../../servicesApi/AddressesApi';
import styles from '../AdminPanel.module.css';

interface AddressManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const AddressManagement: React.FC<AddressManagementProps> = ({ show, onHide, onRefresh }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        city: '',
        street: '',
        house: '',
        metro: '',
        workingHours: ''
    });

    useEffect(() => {
        if (show) {
            loadAddresses();
        }
    }, [show]);

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

    // Фильтрация адресов по поисковому запросу
    const filteredAddresses = useMemo(() => {
        if (!searchTerm.trim()) return addresses;
        const term = searchTerm.toLowerCase().trim();
        return addresses.filter(addr =>
            addr.city.toLowerCase().includes(term) ||
            addr.street.toLowerCase().includes(term)
        );
    }, [addresses, searchTerm]);

    const handleSave = async () => {
        if (!formData.city || !formData.street) {
            alert('Заполните обязательные поля (город и улица)');
            return;
        }

        try {
            if (editingAddress) {
                //await updateAddress(editingAddress.id, formData);
                alert('Адрес обновлен');
            } else {
                //await createAddress(formData);
                alert('Адрес добавлен');
            }
            resetForm();
            await loadAddresses();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить адрес');
        }
    };

    const resetForm = () => {
        setFormData({
            city: '',
            street: '',
            house: '',
            metro: '',
            workingHours: ''
        });
        setEditingAddress(null);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        // setFormData({
        //     city: address.city,
        //     street: address.street,
        //     house: address.house || '',
        //     metro: address.metro || '',
        //     workingHours: address.workingHours || ''
        // });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить адрес?')) {
            try {
                //await deleteAddress(id);
                alert('Адрес удален');
                await loadAddresses();
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Не удалось удалить адрес');
            }
        }
    };

    const clearSearch = () => setSearchTerm('');

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
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

                        {/* Поисковая строка */}
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Поиск по городу, улице, метро..."
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
                                                <strong>{addr.city}, {addr.street} {addr.house}</strong>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <Button
                                                    size="sm"
                                                    className={styles.editBtn}
                                                    onClick={() => handleEdit(addr)}
                                                >
                                                    ✎
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(addr.id)}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>
                    <Col md={6}>
                        <h5>{editingAddress ? 'Редактирование адреса' : 'Добавление адреса'}</h5>
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Город *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Введите город"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Улица *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.street}
                                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                            placeholder="Введите улицу"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Дом</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.house}
                                            onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                                            placeholder="Номер дома"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Метро</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.metro}
                                            onChange={(e) => setFormData({ ...formData, metro: e.target.value })}
                                            placeholder="Ближайшее метро"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Часы работы</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.workingHours}
                                            onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                                            placeholder="Пн-Пт: 9:00-20:00"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Закрыть</Button>
                {editingAddress ? (
                    <Button className={styles.saveBtn} onClick={handleSave}>Сохранить изменения</Button>
                ) : (
                    <Button className={styles.saveBtn} onClick={handleSave}>Добавить адрес</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};