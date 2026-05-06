import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';

import { clientApi } from '../../../../service/IndexAuth';
import { useAuth } from '../../../../contexts/AuthContext';

import styles from './ProfileTab.module.css';

interface ProfileTabProps {
    currentUser: any;
    onRefresh?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ currentUser, onRefresh }) => {
    const { refreshUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ phoneNumber?: string; email?: string }>({});
    const [editedUser, setEditedUser] = useState({
        firstName: currentUser?.firstName || '',
        secondName: currentUser?.secondName || '',
        surName: currentUser?.surName || '',
        email: currentUser?.email || '',
        phoneNumber: currentUser?.phoneNumber || '',
        birthday: currentUser?.birthday || '',
        gender: currentUser?.gender || 'Мужской',
        login: currentUser?.login || ''
    });

    // Валидация номера телефона
    const validatePhoneNumber = (phone: string): boolean => {
        const phoneRegex = /^(\+7|7|8)\d{10}$/;
        return phoneRegex.test(phone);
    };

    // Валидация email
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const formatBirthdayDate = (dateString: string | Date | null | undefined) => {
        if (!dateString) {
            return 'Дата не указана';
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Некорректная дата';
        }
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Обработчик для текстовых полей (input)
    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));

        // Очищаем ошибки при изменении полей
        if (name === 'email' && errors.email) {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
        if (serverError) {
            setServerError(null);
        }
    };

    // Обработчик для select
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
        if (serverError) {
            setServerError(null);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { phoneNumber?: string; email?: string } = {};

        if (editedUser.phoneNumber && !validatePhoneNumber(editedUser.phoneNumber)) {
            newErrors.phoneNumber = 'Неверный формат телефона. Используйте: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX';
        }

        if (editedUser.email && !validateEmail(editedUser.email)) {
            newErrors.email = 'Неверный формат email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveProfile = async () => {
        // Очищаем предыдущие ошибки
        setServerError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await clientApi.update(currentUser?.id, editedUser);
            if (refreshUserData) {
                await refreshUserData();
            }
            if (onRefresh) {
                onRefresh();
            }

            setIsEditing(false);
            alert('Данные успешно обновлены');
        } catch (error: any) {
            console.error('Ошибка обновления:', error);

            // Обработка ошибок от сервера
            if (error.serverMessage) {
                setServerError(error.serverMessage);
            } else if (error.message) {
                setServerError(error.message);
            } else if (error.response?.data?.message) {
                setServerError(error.response.data.message);
            } else if (error.response?.data?.errors) {
                // Обработка валидационных ошибок
                const validationErrors = error.response.data.errors;
                const errorMessages = Object.values(validationErrors).flat().join(', ');
                setServerError(errorMessages);
            } else {
                setServerError('Не удалось обновить данные. Попробуйте позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Обработчик для телефона (с форматированием)
    const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        if (value.startsWith('8') || value.startsWith('7')) {
            setEditedUser(prev => ({ ...prev, phoneNumber: value }));
        } else if (value.startsWith('9') && value.length === 10) {
            setEditedUser(prev => ({ ...prev, phoneNumber: `+7${value}` }));
        } else {
            setEditedUser(prev => ({ ...prev, phoneNumber: value }));
        }

        if (errors.phoneNumber) {
            setErrors(prev => ({ ...prev, phoneNumber: undefined }));
        }
        if (serverError) {
            setServerError(null);
        }
    };

    const birthdayCorrectDate = formatBirthdayDate(currentUser?.birthday);

    return (
        <Card className={styles.contentCard}>
            <Card.Body>
                <div className={styles.profileHeader}>
                    <h2 className={styles.sectionTitle}>Личные данные</h2>
                    <Button
                        className={styles.editButton}
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline-secondary"
                        disabled={loading}
                    >
                        {isEditing ? 'Отмена' : '✎ Редактировать'}
                    </Button>
                </div>

                {/* Отображение ошибки от сервера */}
                {serverError && (
                    <Alert variant="danger" className={styles.errorAlert} onClose={() => setServerError(null)} dismissible>
                        <Alert.Heading>Ошибка!</Alert.Heading>
                        <p>{serverError}</p>
                    </Alert>
                )}

                {isEditing ? (
                    <Form>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Логин</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="login"
                                        value={editedUser.login}
                                        onChange={handleTextInputChange}
                                        className={styles.formInput}
                                        isInvalid={!!serverError && serverError.includes('логин')}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Имя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={editedUser.firstName}
                                        onChange={handleTextInputChange}
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
                                        onChange={handleTextInputChange}
                                        className={styles.formInput}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Отчество</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="surName"
                                        value={editedUser.surName || ''}
                                        onChange={handleTextInputChange}
                                        className={styles.formInput}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={editedUser.email}
                                        onChange={handleTextInputChange}
                                        isInvalid={!!errors.email}
                                        className={styles.formInput}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Телефон</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phoneNumber"
                                        value={editedUser.phoneNumber}
                                        onChange={handlePhoneInput}
                                        isInvalid={!!errors.phoneNumber}
                                        className={styles.formInput}
                                        placeholder="+7XXXXXXXXXX"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phoneNumber}
                                    </Form.Control.Feedback>
                                    <small className="text-muted">Формат: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX</small>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Дата рождения</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="birthday"
                                        value={editedUser.birthday?.split('T')[0] || ''}
                                        onChange={handleTextInputChange}
                                        className={styles.formInput}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Пол</Form.Label>
                                    <Form.Select
                                        name="gender"
                                        value={editedUser.gender}
                                        onChange={handleSelectChange}
                                        className={styles.formInput}
                                    >
                                        <option value="Мужской">Мужской</option>
                                        <option value="Женский">Женский</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className={styles.buttonGroup}>
                            <Button
                                className={styles.saveButton}
                                onClick={saveProfile}
                                disabled={loading}
                            >
                                {loading ? 'Сохранение...' : 'Сохранить изменения'}
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div className={styles.profileInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>ФИО:</span>
                            <span className={styles.infoValue}>
                                {`${currentUser?.secondName || ''} ${currentUser?.firstName || ''} ${currentUser?.surName || ''}`.trim() || 'Не указано'}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Email:</span>
                            <span className={styles.infoValue}>{currentUser?.email || 'Не указан'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Телефон:</span>
                            <span className={styles.infoValue}>{currentUser?.phoneNumber || 'Не указан'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Дата рождения:</span>
                            <span className={styles.infoValue}>{birthdayCorrectDate}</span>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};