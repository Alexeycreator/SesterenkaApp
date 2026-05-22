import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col, Alert } from 'react-bootstrap';

import { createTermsOfUse, updateTermsOfUse, deleteTermsOfUseById, getAllTermsOfUse, TermsOfUse } from '../../../servicesApi/TermsOfUseApi';
import { useAuth } from '../../../../contexts/AuthContext';

import styles from '../TermsOfUsePage.module.css';

interface TermsOfUseManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const TermsOfUseManagement: React.FC<TermsOfUseManagementProps> = ({ show, onHide, onRefresh }) => {
    const { user: currentUser } = useAuth();
    const [termsOfUse, setTermsOfUse] = useState<TermsOfUse[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<TermsOfUse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [serverErrors, setServerErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState({
        title: '',
        icon: '📜',
        content: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Загрузка данных
    const loadTermsOfUse = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            setServerErrors({});
            const data = await getAllTermsOfUse();
            setTermsOfUse(data);
        } catch (error: any) {
            console.error('Ошибка загрузки пользовательского соглашения:', error);

            if (error.response?.data?.errors) {
                setServerErrors(error.response.data.errors);
                const firstError = Object.values(error.response.data.errors)[0];
                setErrorMessage(Array.isArray(firstError) ? firstError[0] : String(firstError));
            } else if (error.serverMessage) {
                setErrorMessage(error.serverMessage);
            } else {
                setErrorMessage('Не удалось загрузить пользовательское соглашение');
            }
            setTimeout(() => {
                setErrorMessage(null);
                setServerErrors({});
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            loadTermsOfUse();
        } else {
            resetForm();
        }
    }, [show]);

    // Фильтрация
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return termsOfUse;
        const term = searchTerm.toLowerCase().trim();
        return termsOfUse.filter(item =>
            item.title.toLowerCase().includes(term) ||
            item.content.toLowerCase().includes(term)
        );
    }, [termsOfUse, searchTerm]);

    // Очистка формы
    const resetForm = () => {
        setFormData({
            title: '',
            icon: '📜',
            content: '',
            date: new Date().toISOString().split('T')[0]
        });
        setEditingItem(null);
        setErrorMessage(null);
        setServerErrors({});
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // Создание
    const handleCreate = async () => {
        if (!currentUser?.id) {
            setErrorMessage('Пользователь не авторизован');
            return;
        }

        if (!formData.title.trim()) {
            setErrorMessage('Введите заголовок раздела');
            return;
        }

        if (!formData.content.trim()) {
            setErrorMessage('Введите содержание раздела');
            return;
        }

        setSaving(true);
        setErrorMessage(null);
        setServerErrors({});

        try {
            await createTermsOfUse(currentUser.id, {
                id: 0,
                title: formData.title.trim(),
                icon: formData.icon.trim() || '📜',
                content: formData.content.trim(),
                date: new Date(formData.date).toISOString().split('T')[0]
            });
            showSuccess('Раздел успешно создан');
            resetForm();
            await loadTermsOfUse();
            onRefresh?.();
        } catch (error: any) {
            console.error('Ошибка создания:', error);

            if (error.response?.status === 400 && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                setServerErrors(errors);
                const firstError = Object.values(errors)[0];
                const errorText = Array.isArray(firstError) ? firstError[0] : String(firstError);
                setErrorMessage(errorText);
            } else if (error.serverMessage) {
                setErrorMessage(error.serverMessage);
            } else {
                setErrorMessage('Не удалось создать раздел');
            }
            setTimeout(() => {
                setErrorMessage(null);
                setServerErrors({});
            }, 5000);
        } finally {
            setSaving(false);
        }
    };

    // Обновление
    const handleUpdate = async () => {
        if (!currentUser?.id) {
            setErrorMessage('Пользователь не авторизован');
            return;
        }

        if (!editingItem) {
            setErrorMessage('Раздел не выбран');
            return;
        }

        if (!formData.title.trim()) {
            setErrorMessage('Введите заголовок раздела');
            return;
        }

        if (!formData.content.trim()) {
            setErrorMessage('Введите содержание раздела');
            return;
        }

        setSaving(true);
        setErrorMessage(null);
        setServerErrors({});

        try {
            await updateTermsOfUse(currentUser.id, {
                id: editingItem.id,
                title: formData.title.trim(),
                icon: formData.icon.trim() || '📜',
                content: formData.content.trim(),
                date: new Date(formData.date).toISOString().split('T')[0]
            });
            showSuccess('Раздел успешно обновлён');
            resetForm();
            await loadTermsOfUse();
            onRefresh?.();
        } catch (error: any) {
            console.error('Ошибка обновления:', error);

            if (error.response?.status === 400 && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                setServerErrors(errors);
                const firstError = Object.values(errors)[0];
                const errorText = Array.isArray(firstError) ? firstError[0] : String(firstError);
                setErrorMessage(errorText);
            } else if (error.serverMessage) {
                setErrorMessage(error.serverMessage);
            } else {
                setErrorMessage('Не удалось обновить раздел');
            }
            setTimeout(() => {
                setErrorMessage(null);
                setServerErrors({});
            }, 5000);
        } finally {
            setSaving(false);
        }
    };

    // Удаление
    const handleDelete = async (item: TermsOfUse) => {
        if (!currentUser?.id) {
            setErrorMessage('Пользователь не авторизован');
            return;
        }

        if (!window.confirm(`Удалить раздел "${item.title}"?`)) {
            return;
        }

        setSaving(true);
        setErrorMessage(null);

        try {
            await deleteTermsOfUseById(currentUser.id, item.id);
            showSuccess('Раздел успешно удалён');
            await loadTermsOfUse();
            onRefresh?.();
        } catch (error: any) {
            console.error('Ошибка удаления:', error);
            const msg = error.serverMessage || error.message || 'Не удалось удалить раздел';
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item: TermsOfUse) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            icon: item.icon || '📜',
            content: item.content,
            date: new Date(item.date).toISOString().split('T')[0]
        });
    };

    const clearSearch = () => setSearchTerm('');

    // Функция для предпросмотра содержимого
    const getContentPreview = (content: string) => {
        if (content.length > 100) {
            return content.substring(0, 100) + '...';
        }
        return content;
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered className={styles.modal}>
            <Modal.Header closeButton>
                <Modal.Title>📜 Управление пользовательским соглашением</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Уведомления */}
                {successMessage && (
                    <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
                        <Alert.Heading>✅ Успешно!</Alert.Heading>
                        <p>{successMessage}</p>
                    </Alert>
                )}
                {errorMessage && (
                    <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
                        <Alert.Heading>❌ Ошибка!</Alert.Heading>
                        <p>{errorMessage}</p>
                    </Alert>
                )}

                {/* Ошибки валидации полей */}
                {Object.keys(serverErrors).length > 0 && (
                    <Alert variant="danger" onClose={() => setServerErrors({})} dismissible>
                        <Alert.Heading>❌ Ошибка валидации!</Alert.Heading>
                        <ul className="mb-0">
                            {Object.entries(serverErrors).map(([field, error]) => (
                                <li key={field}>
                                    <strong>{field}:</strong> {Array.isArray(error) ? error[0] : error}
                                </li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Row>
                    {/* Левая колонка - список разделов */}
                    <Col md={5}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Список разделов</h5>
                            <Button size="sm" variant="outline-primary" onClick={loadTermsOfUse} disabled={loading}>
                                🔄 Обновить
                            </Button>
                        </div>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Поиск по заголовку или содержанию..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && <Button variant="outline-secondary" onClick={clearSearch}>✕</Button>}
                        </InputGroup>
                        <div className={styles.itemsList}>
                            {loading ? (
                                <p className="text-center">Загрузка...</p>
                            ) : filteredItems.length === 0 ? (
                                <p className="text-center text-muted">{searchTerm ? 'Разделы не найдены' : 'Нет разделов'}</p>
                            ) : (
                                <>
                                    <div className={styles.searchInfo}>Найдено: {filteredItems.length} из {termsOfUse.length}</div>
                                    {filteredItems.map(item => (
                                        <div key={item.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}>
                                                <strong>
                                                    <span className={styles.itemIcon}>{item.icon || '📜'}</span>
                                                    {item.title}
                                                </strong>
                                                <span className="small text-muted">{getContentPreview(item.content)}</span>
                                                <span className="small text-muted">📅 {new Date(item.date).toLocaleDateString('ru-RU')}</span>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <Button size="sm" className={styles.editBtn} onClick={() => handleEdit(item)} disabled={saving}>✎</Button>
                                                <Button size="sm" className={styles.deleteBtn} onClick={() => handleDelete(item)} disabled={saving}>✕</Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>

                    {/* Правая колонка - форма редактирования/добавления */}
                    <Col md={7}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>{editingItem ? 'Редактирование раздела' : 'Добавление раздела'}</h5>
                            {!editingItem && (
                                <Button size="sm" variant="outline-secondary" onClick={resetForm} disabled={saving}>
                                    🗑️ Очистить
                                </Button>
                            )}
                        </div>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Дата *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    disabled={saving}
                                />
                                <Form.Text className="text-muted">
                                    Если не указать, будет использована текущая дата
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Иконка (эмодзи) *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="📜"
                                    disabled={saving}
                                />
                                <Form.Text className="text-muted">
                                    Пример: 📜, ⚖️, 📋, 🔒
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Заголовок раздела *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Введите заголовок раздела"
                                    disabled={saving}
                                    isInvalid={!!serverErrors.title}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {serverErrors.title}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Содержание раздела *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={12}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Введите содержание раздела..."
                                    disabled={saving}
                                    isInvalid={!!serverErrors.content}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {serverErrors.content}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Для переноса строки используйте Enter. Для создания маркированного списка используйте символы: -, •, *, или цифры с точкой (1., 2., etc.)
                                </Form.Text>
                            </Form.Group>

                            <div className="d-flex gap-2 mt-3">
                                {!editingItem && (
                                    <Button variant="secondary" onClick={resetForm} className="flex-grow-1" disabled={saving}>
                                        🗑️ Очистить форму
                                    </Button>
                                )}
                                <Button
                                    className={styles.saveBtn}
                                    onClick={editingItem ? handleUpdate : handleCreate}
                                    disabled={saving || !formData.title.trim() || !formData.content.trim()}
                                    style={{ flex: editingItem ? 1 : 2 }}
                                >
                                    {saving ? 'Сохранение...' : (editingItem ? 'Сохранить изменения' : '➕ Добавить раздел')}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={saving}>Закрыть</Button>
            </Modal.Footer>
        </Modal>
    );
};