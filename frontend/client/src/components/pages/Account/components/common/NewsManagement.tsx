import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col, Alert } from 'react-bootstrap';

import { createNews, updateNews, deleteNewsById, getAllNews, News } from '../../../../servicesApi/NewsApi';
import { useAuth } from '../../../../../contexts/AuthContext';

import styles from '../AdminPanel.module.css';

interface NewsManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const NewsManagement: React.FC<NewsManagementProps> = ({ show, onHide, onRefresh }) => {
    const { user: currentUser } = useAuth();
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // ← формат YYYY-MM-DD для input
        theme: '',
        body: '',
        image: '',
        type: 'Новость'
    });
    // Состояние для отображения ошибок валидации полей
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Загрузка новостей
    const loadNews = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const data = await getAllNews();
            setNews(data);
        } catch (error: any) {
            console.error('Ошибка загрузки новостей:', error);
            const msg = error.serverMessage || 'Не удалось загрузить список новостей';
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            loadNews();
        } else {
            resetForm();
        }
    }, [show]);

    // Фильтрация новостей
    const filteredNews = useMemo(() => {
        if (!searchTerm.trim()) return news;
        const term = searchTerm.toLowerCase().trim();
        return news.filter(item =>
            item.theme.toLowerCase().includes(term) ||
            item.body.toLowerCase().includes(term) ||
            item.type?.toLowerCase().includes(term)
        );
    }, [news, searchTerm]);

    // Очистка формы
    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            theme: '',
            body: '',
            image: '',
            type: 'Новость'
        });
        setEditingNews(null);
        setErrorMessage(null);
        setFieldErrors({});
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const showError = (message: string) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 5000);
    };

    // Создание новости
    const handleCreate = async () => {
        if (!currentUser?.id) {
            showError('Пользователь не авторизован');
            return;
        }

        if (!formData.theme.trim()) {
            showError('Введите заголовок новости');
            return;
        }

        if (!formData.body.trim()) {
            showError('Введите текст новости');
            return;
        }

        setSaving(true);
        setErrorMessage(null);
        setFieldErrors({});

        try {
            // Отправляем дату в формате ISO строки
            const newsData = {
                id: 0,
                date: formData.date, // уже в формате YYYY-MM-DD
                theme: formData.theme.trim(),
                body: formData.body.trim(),
                image: formData.image.trim() || null,
                type: formData.type
            };

            await createNews(currentUser.id, newsData);
            showSuccess('Новость успешно создана');
            resetForm();
            await loadNews();
            onRefresh?.();
        } catch (error: any) {
            console.error('Ошибка создания новости:', error);
            
            // Обработка валидационных ошибок от сервера
            if (error.response?.data?.errors) {
                setFieldErrors(error.response.data.errors);
                const firstError = Object.values(error.response.data.errors)[0];
                const errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
                showError(errorMsg);
            } else {
                const msg = error.serverMessage || error.message || 'Не удалось создать новость';
                showError(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    // Обновление новости
    const handleUpdate = async () => {
        if (!currentUser?.id) {
            showError('Пользователь не авторизован');
            return;
        }

        if (!editingNews) {
            showError('Новость не выбрана');
            return;
        }

        if (!formData.theme.trim()) {
            showError('Введите заголовок новости');
            return;
        }

        if (!formData.body.trim()) {
            showError('Введите текст новости');
            return;
        }

        setSaving(true);
        setErrorMessage(null);
        setFieldErrors({});

        try {
            // Отправляем дату в формате YYYY-MM-DD
            const newsData = {
                id: editingNews.id,
                date: formData.date,
                theme: formData.theme.trim(),
                body: formData.body.trim(),
                image: formData.image.trim() || null,
                type: formData.type
            };

            await updateNews(currentUser.id, newsData);
            showSuccess('Новость успешно обновлена');
            resetForm();
            await loadNews();
            onRefresh?.();
        } catch (error: any) {
            console.error('Ошибка обновления новости:', error);
            
            // Обработка валидационных ошибок от сервера
            if (error.response?.data?.errors) {
                setFieldErrors(error.response.data.errors);
                const firstError = Object.values(error.response.data.errors)[0];
                const errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
                showError(errorMsg);
            } else {
                const msg = error.serverMessage || error.message || 'Не удалось обновить новость';
                showError(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    // Удаление новости
    const handleDelete = async (newsItem: News) => {
        if (!currentUser?.id) {
            showError('Пользователь не авторизован');
            return;
        }

        if (!window.confirm(`Удалить новость "${newsItem.theme}"?`)) {
            return;
        }

        setSaving(true);
        setErrorMessage(null);

        try {
            await deleteNewsById(currentUser.id, newsItem.id);
            showSuccess('Новость успешно удалена');
            await loadNews();
            onRefresh?.();
        } catch (error: any) {
            console.error('Ошибка удаления новости:', error);
            const msg = error.serverMessage || error.message || 'Не удалось удалить новость';
            showError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (newsItem: News) => {
        // Преобразуем дату из объекта Date в строку YYYY-MM-DD
        let dateStr = '';
        if (newsItem.date) {
            const date = new Date(newsItem.date);
            if (!isNaN(date.getTime())) {
                dateStr = date.toISOString().split('T')[0];
            }
        }
        
        setEditingNews(newsItem);
        setFormData({
            date: dateStr || new Date().toISOString().split('T')[0],
            theme: newsItem.theme,
            body: newsItem.body,
            image: newsItem.image || '',
            type: newsItem.type || 'Новость'
        });
        setFieldErrors({});
    };

    const clearSearch = () => setSearchTerm('');

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Дата не указана';
        return d.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>📰 Управление новостями</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Уведомления */}
                {successMessage && (
                    <Alert variant="success" className={styles.successAlert} onClose={() => setSuccessMessage(null)} dismissible>
                        <Alert.Heading>✅ Успешно!</Alert.Heading>
                        <p>{successMessage}</p>
                    </Alert>
                )}
                {errorMessage && (
                    <Alert variant="danger" className={styles.errorAlert} onClose={() => setErrorMessage(null)} dismissible>
                        <Alert.Heading>❌ Ошибка!</Alert.Heading>
                        <p>{errorMessage}</p>
                    </Alert>
                )}

                {/* Ошибки валидации полей */}
                {Object.keys(fieldErrors).length > 0 && (
                    <Alert variant="danger" onClose={() => setFieldErrors({})} dismissible>
                        <Alert.Heading>❌ Ошибка валидации!</Alert.Heading>
                        <ul className="mb-0">
                            {Object.entries(fieldErrors).map(([field, error]) => (
                                <li key={field}>
                                    <strong>{field}:</strong> {Array.isArray(error) ? error[0] : error}
                                </li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Row>
                    <Col md={6}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Список новостей</h5>
                            <Button size="sm" variant="outline-primary" onClick={loadNews} disabled={loading}>
                                🔄 Обновить
                            </Button>
                        </div>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Поиск по заголовку, тексту или типу..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && <Button variant="outline-secondary" onClick={clearSearch}>✕</Button>}
                        </InputGroup>
                        <div className={styles.itemsList}>
                            {loading ? (
                                <p className="text-center">Загрузка...</p>
                            ) : filteredNews.length === 0 ? (
                                <p className="text-center text-muted">{searchTerm ? 'Новости не найдены' : 'Нет новостей'}</p>
                            ) : (
                                <>
                                    <div className={styles.searchInfo}>Найдено: {filteredNews.length} из {news.length}</div>
                                    {filteredNews.map(item => (
                                        <div key={item.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}>
                                                <strong>{item.theme}</strong>
                                                <span className="small">{formatDate(item.date)}</span>
                                                <span>{item.type && <span className={styles.shopBadge}>{item.type}</span>}</span>
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
                    <Col md={6}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>{editingNews ? 'Редактирование новости' : 'Добавление новости'}</h5>
                            {!editingNews && (
                                <Button size="sm" variant="outline-secondary" onClick={resetForm} disabled={saving}>
                                    🗑️ Очистить
                                </Button>
                            )}
                        </div>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Дата</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    disabled={saving}
                                    isInvalid={!!fieldErrors.date}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.date}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Если не указать, будет использована текущая дата
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Заголовок *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.theme}
                                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                    placeholder="Введите заголовок новости"
                                    disabled={saving}
                                    isInvalid={!!fieldErrors.theme}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.theme}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Текст новости *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={8}
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    placeholder="Введите текст новости..."
                                    disabled={saving}
                                    isInvalid={!!fieldErrors.body}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.body}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Тип новости</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    placeholder="Новость, Статья, Обновление и т.д."
                                    disabled={saving}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>URL изображения</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="Images/News/filename.jpg"
                                    disabled={saving}
                                />
                                <Form.Text className="text-muted">
                                    Пример: Images/News/news-001.jpg
                                </Form.Text>
                            </Form.Group>

                            {formData.image && (
                                <div className="text-center mb-3">
                                    <img
                                        src={`http://localhost:5027/${formData.image}`}
                                        alt="Предпросмотр"
                                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="d-flex gap-2 mt-3">
                                {!editingNews && (
                                    <Button variant="secondary" onClick={resetForm} className="flex-grow-1" disabled={saving}>
                                        🗑️ Очистить форму
                                    </Button>
                                )}
                                <Button
                                    className={styles.saveBtn}
                                    onClick={editingNews ? handleUpdate : handleCreate}
                                    disabled={saving || !formData.theme.trim() || !formData.body.trim()}
                                    style={{ flex: editingNews ? 1 : 2 }}
                                >
                                    {saving ? 'Сохранение...' : (editingNews ? 'Сохранить изменения' : '➕ Добавить новость')}
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