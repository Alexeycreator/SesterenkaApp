import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';

import { getCategories, Categories } from '../../../../servicesApi/CategoriesApi';

import styles from '../AdminPanel.module.css';

interface CategoryManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({ show, onHide, onRefresh }) => {
    const [categories, setCategories] = useState<Categories[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Categories | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        icon: '',
        description: ''
    });

    useEffect(() => {
        if (show) {
            loadCategories();
        } else {
            resetAllStates();
        }
    }, [show]);

    const resetAllStates = () => {
        setFormData({ name: '', icon: '', description: '' });
        setEditingCategory(null);
        setSearchTerm('');
        setCategories([]);
    };

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return categories;
        const term = searchTerm.toLowerCase().trim();
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(term) ||
            (cat.description && cat.description.toLowerCase().includes(term))
        );
    }, [categories, searchTerm]);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('Введите название категории');
            return;
        }

        setSaving(true);
        try {
            if (editingCategory) {
                //await updateCategory(editingCategory.id, formData);
                alert('Категория успешно обновлена');
            } else {
                //await createCategory(formData);
                alert('Категория успешно добавлена');
            }
            resetForm();
            await loadCategories();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить категорию');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', icon: '', description: '' });
        setEditingCategory(null);
    };

    const clearForm = () => {
        setFormData({ name: '', icon: '', description: '' });
        if (editingCategory) {
            setEditingCategory(null);
        }
        alert('Форма очищена');
    };

    const handleEdit = (category: Categories) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            icon: category.icon || '',
            description: category.description || ''
        });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить категорию?')) {
            setSaving(true);
            try {
                //await deleteCategory(id);
                alert('Категория успешно удалена');
                await loadCategories();
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Не удалось удалить категорию');
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
                <Modal.Title>Управление категориями</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={5}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Список категорий</h5>
                            <Button size="sm" variant="outline-primary" onClick={loadCategories} disabled={loading}>
                                🔄 Обновить
                            </Button>
                        </div>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Поиск по названию или описанию..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <Button variant="outline-secondary" onClick={clearSearch}>✕</Button>
                            )}
                        </InputGroup>
                        <div className={styles.itemsList}>
                            {loading ? (
                                <p className="text-center">Загрузка...</p>
                            ) : filteredCategories.length === 0 ? (
                                <p className="text-center text-muted">{searchTerm ? 'Категории не найдены' : 'Нет категорий'}</p>
                            ) : (
                                <>
                                    <div className={styles.searchInfo}>Найдено: {filteredCategories.length} из {categories.length}</div>
                                    {filteredCategories.map(cat => (
                                        <div key={cat.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}>
                                                <strong><span className={styles.itemIcon}>{cat.icon || '📁'}</span> {cat.name}</strong>
                                                {cat.description && <span className="text-muted">{cat.description}</span>}
                                            </div>
                                            <div className={styles.itemActions}>
                                                <Button size="sm" className={styles.editBtn} onClick={() => handleEdit(cat)} disabled={saving}>✎</Button>
                                                <Button size="sm" className={styles.deleteBtn} onClick={() => handleDelete(cat.id)} disabled={saving}>✕</Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>
                    <Col md={7}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>{editingCategory ? 'Редактирование категории' : 'Добавление категории'}</h5>
                            {!editingCategory && (
                                <Button size="sm" variant="outline-secondary" onClick={clearForm} disabled={saving}>
                                    🗑️ Очистить
                                </Button>
                            )}
                        </div>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Название категории *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Введите название"
                                    disabled={saving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Иконка (эмодзи)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="🛢️"
                                    disabled={saving}
                                />
                                <small className="text-muted">Например: 🔧, 🚗, 🛢️, ⚙️</small>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Описание</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Введите описание"
                                    disabled={saving}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2 mt-3">
                                {!editingCategory && (
                                    <Button variant="secondary" onClick={clearForm} className="flex-grow-1" disabled={saving}>
                                        🗑️ Очистить форму
                                    </Button>
                                )}
                                <Button
                                    className={styles.saveBtn}
                                    onClick={handleSave}
                                    disabled={saving || !formData.name.trim()}
                                    style={{ flex: editingCategory ? 1 : 2 }}
                                >
                                    {saving ? 'Сохранение...' : (editingCategory ? 'Сохранить изменения' : '➕ Добавить категорию')}
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