import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';

import { createManufacturer, deleteManufacturer, getManufacturers, Manufacturer, updateManufacturer } from '../../../../servicesApi/ManufacturersApi';

import styles from '../AdminPanel.module.css';

interface ManufacturerManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const ManufacturerManagement: React.FC<ManufacturerManagementProps> = ({ show, onHide, onRefresh }) => {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        if (show) {
            loadManufacturers();
        } else {
            resetAllStates();
        }
    }, [show]);

    const resetAllStates = () => {
        setFormData({ name: '' });
        setEditingManufacturer(null);
        setSearchTerm('');
        setManufacturers([]);
    };

    const loadManufacturers = async () => {
        try {
            setLoading(true);
            const data = await getManufacturers();
            setManufacturers(data);
        } catch (error: any) {
            console.error('Ошибка загрузки брендов:', error);
            alert(error.serverMessage || 'Не удалось загрузить список брендов');
        } finally {
            setLoading(false);
        }
    };

    const filteredManufacturers = useMemo(() => {
        if (!searchTerm.trim()) return manufacturers;
        const term = searchTerm.toLowerCase().trim();
        return manufacturers.filter(m => m.name.toLowerCase().includes(term));
    }, [manufacturers, searchTerm]);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('Введите название бренда');
            return;
        }

        setSaving(true);
        try {
            if (editingManufacturer) {
                await updateManufacturer(editingManufacturer.id, { name: formData.name });
                alert('Бренд успешно обновлен');
            } else {
                await createManufacturer({ name: formData.name });
                alert('Бренд успешно добавлен');
            }
            resetForm();
            await loadManufacturers();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('Ошибка сохранения:', error);
            if (error.serverMessage) {
                alert(error.serverMessage);
            } else if (error.message) {
                alert(error.message);
            } else {
                alert('Не удалось сохранить бренд');
            }
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '' });
        setEditingManufacturer(null);
    };

    const clearForm = () => {
        setFormData({ name: '' });
        if (editingManufacturer) {
            setEditingManufacturer(null);
        }
    };

    const handleEdit = (manufacturer: Manufacturer) => {
        setEditingManufacturer(manufacturer);
        setFormData({ name: manufacturer.name });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить бренд?')) {
            setSaving(true);
            try {
                await deleteManufacturer(id);
                alert('Бренд успешно удален');
                await loadManufacturers();
                if (onRefresh) onRefresh();
            } catch (error: any) {
                console.error('Ошибка удаления:', error);
                if (error.serverMessage) {
                    alert(error.serverMessage);
                } else if (error.message) {
                    alert(error.message);
                } else {
                    alert('Не удалось удалить бренд');
                }
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
                <Modal.Title>Управление брендами</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={5}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Список брендов</h5>
                            <Button size="sm" variant="outline-primary" onClick={loadManufacturers} disabled={loading}>
                                🔄 Обновить
                            </Button>
                        </div>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Поиск по названию..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && <Button variant="outline-secondary" onClick={clearSearch}>✕</Button>}
                        </InputGroup>
                        <div className={styles.itemsList}>
                            {loading ? (
                                <p className="text-center">Загрузка...</p>
                            ) : filteredManufacturers.length === 0 ? (
                                <p className="text-center text-muted">{searchTerm ? 'Бренды не найдены' : 'Нет брендов'}</p>
                            ) : (
                                <>
                                    <div className={styles.searchInfo}>Найдено: {filteredManufacturers.length} из {manufacturers.length}</div>
                                    {filteredManufacturers.map(m => (
                                        <div key={m.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}><strong>{m.name}</strong></div>
                                            <div className={styles.itemActions}>
                                                <Button size="sm" className={styles.editBtn} onClick={() => handleEdit(m)} disabled={saving}>✎</Button>
                                                <Button size="sm" className={styles.deleteBtn} onClick={() => handleDelete(m.id)} disabled={saving}>✕</Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>
                    <Col md={7}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>{editingManufacturer ? 'Редактирование бренда' : 'Добавление бренда'}</h5>
                            {!editingManufacturer && (
                                <Button size="sm" variant="outline-secondary" onClick={clearForm} disabled={saving}>
                                    🗑️ Очистить
                                </Button>
                            )}
                        </div>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Название бренда *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Введите название бренда"
                                    disabled={saving}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2 mt-3">
                                {!editingManufacturer && (
                                    <Button variant="secondary" onClick={clearForm} className="flex-grow-1" disabled={saving}>
                                        🗑️ Очистить форму
                                    </Button>
                                )}
                                <Button
                                    className={styles.saveBtn}
                                    onClick={handleSave}
                                    disabled={saving || !formData.name.trim()}
                                    style={{ flex: editingManufacturer ? 1 : 2 }}
                                >
                                    {saving ? 'Сохранение...' : (editingManufacturer ? 'Сохранить изменения' : '➕ Добавить бренд')}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={saving}>Закрыть</Button>
            </Modal.Footer>
        </Modal>
    );
};