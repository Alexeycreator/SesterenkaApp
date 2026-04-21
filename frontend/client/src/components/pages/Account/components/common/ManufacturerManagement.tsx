import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';

import { getManufacturers, Manufacturer } from '../../../../servicesApi/ManufacturersApi';

import styles from '../AdminPanel.module.css';

interface ManufacturerManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const ManufacturerManagement: React.FC<ManufacturerManagementProps> = ({ show, onHide, onRefresh }) => {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        if (show) {
            loadManufacturers();
        }
    }, [show]);

    const loadManufacturers = async () => {
        try {
            setLoading(true);
            const data = await getManufacturers();
            setManufacturers(data);
        } catch (error) {
            console.error('Ошибка загрузки брендов:', error);
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
        if (!formData.name) {
            alert('Введите название бренда');
            return;
        }

        try {
            if (editingManufacturer) {
                //await updateManufacturer(editingManufacturer.id, formData);
                alert('Бренд обновлен');
            } else {
                //await createManufacturer(formData);
                alert('Бренд добавлен');
            }
            resetForm();
            await loadManufacturers();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить бренд');
        }
    };

    const resetForm = () => {
        setFormData({ name: '' });
        setEditingManufacturer(null);
    };

    const handleEdit = (manufacturer: Manufacturer) => {
        setEditingManufacturer(manufacturer);
        setFormData({ name: manufacturer.name });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить бренд?')) {
            try {
                //await deleteManufacturer(id);
                alert('Бренд удален');
                await loadManufacturers();
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Не удалось удалить бренд');
            }
        }
    };

    const clearSearch = () => setSearchTerm('');

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
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
                                                <Button size="sm" className={styles.editBtn} onClick={() => handleEdit(m)}>✎</Button>
                                                <Button size="sm" className={styles.deleteBtn} onClick={() => handleDelete(m.id)}>✕</Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>
                    <Col md={7}>
                        <h5>{editingManufacturer ? 'Редактирование бренда' : 'Добавление бренда'}</h5>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Название бренда *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Введите название бренда"
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Закрыть</Button>
                <Button className={styles.saveBtn} onClick={handleSave}>
                    {editingManufacturer ? 'Сохранить изменения' : 'Добавить бренд'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};