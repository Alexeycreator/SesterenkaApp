import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

import { useAuth } from '../../../../contexts/AuthContext';
import { authApi } from '../../../../service/IndexAuth';

import styles from './AuthModal.module.css';

interface AuthModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    redirectTo?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, onSuccess, redirectTo }) => {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        secondName: '',
        firstName: '',
        surName: '',
        email: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Валидация номера телефона (как на сервере)
    const validatePhoneNumber = (phone: string): boolean => {
        const phoneRegex = /^(\+7|7|8)\d{10}$/;
        return phoneRegex.test(phone);
    };

    // Валидация email
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Форматирование телефона при вводе
    const handlePhoneInput = (value: string): string => {
        let cleaned = value.replace(/\D/g, '');

        if (cleaned.length > 11) {
            cleaned = cleaned.slice(0, 11);
        }

        if (cleaned.startsWith('8') || cleaned.startsWith('7')) {
            return cleaned;
        } else if (cleaned.startsWith('9') && cleaned.length === 10) {
            return `+7${cleaned}`;
        }

        return cleaned;
    };

    const clearErrors = () => {
        setError(null);
        setFieldErrors({});
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!isLogin) {
            if (!formData.secondName.trim()) {
                errors.secondName = 'Введите фамилию';
            }
            if (!formData.firstName.trim()) {
                errors.firstName = 'Введите имя';
            }
            if (!formData.email.trim()) {
                errors.email = 'Введите email';
            } else if (!validateEmail(formData.email)) {
                errors.email = 'Введите корректный email';
            }
            if (!formData.phoneNumber.trim()) {
                errors.phoneNumber = 'Введите телефон';
            } else if (!validatePhoneNumber(formData.phoneNumber)) {
                errors.phoneNumber = 'Неверный формат телефона. Используйте: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX';
            }
        }

        if (!formData.login.trim()) {
            errors.login = 'Введите логин';
        }
        if (!formData.password) {
            errors.password = 'Введите пароль';
        } else if (!isLogin && formData.password.length < 6) {
            errors.password = 'Пароль должен быть не менее 6 символов';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        clearErrors();

        try {
            if (isLogin) {
                await login(formData.login, formData.password);

                const storedUser = authApi.getStoredUser();
                window.dispatchEvent(new CustomEvent('authChange', { detail: { user: storedUser } }));

                onSuccess?.();
                onClose();
            } else {
                const response = await authApi.register({
                    login: formData.login,
                    password: formData.password,
                    secondName: formData.secondName,
                    firstName: formData.firstName,
                    surName: formData.surName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber
                });

                if (response) {
                    await login(formData.login, formData.password);
                    const storedUser = authApi.getStoredUser();
                    window.dispatchEvent(new CustomEvent('authChange', { detail: { user: storedUser } }));

                    onSuccess?.();
                    onClose();
                }
            }
        } catch (err: any) {
            console.error('Ошибка:', err);

            if (err.statusCode === 401) {
                setError('Неверный логин или пароль');
                setFieldErrors({
                    login: 'Проверьте логин',
                    password: 'Проверьте пароль'
                });
            } else if (err.statusCode === 409) {
                setError(err.serverMessage || 'Пользователь с такими данными уже существует');
            } else if (err.statusCode === 400) {
                if (err.data?.errors) {
                    const validationErrors: Record<string, string> = {};
                    Object.entries(err.data.errors).forEach(([key, value]) => {
                        validationErrors[key] = Array.isArray(value) ? value[0] : String(value);
                    });
                    setFieldErrors(validationErrors);
                    setError('Пожалуйста, исправьте ошибки в форме');
                } else {
                    setError(err.serverMessage || err.message || 'Ошибка при обработке запроса');
                }
            } else if (err.serverMessage) {
                setError(err.serverMessage);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Произошла ошибка. Пожалуйста, попробуйте позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (field: string, value: string) => {
        let newValue = value;

        if (field === 'phoneNumber') {
            newValue = handlePhoneInput(value);
        }

        setFormData(prev => ({ ...prev, [field]: newValue }));

        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        if (error) setError(null);
    };

    return (
        <Modal show={show} onHide={onClose} centered className={styles.authModal}>
            <Modal.Header closeButton>
                <Modal.Title>{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className={styles.errorAlert} onClose={() => setError(null)} dismissible>
                        <Alert.Heading>❌ Ошибка!</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                    {!isLogin && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Фамилия *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите фамилию"
                                    value={formData.secondName}
                                    onChange={(e) => handleFieldChange('secondName', e.target.value)}
                                    isInvalid={!!fieldErrors.secondName}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.secondName}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Имя *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите имя"
                                    value={formData.firstName}
                                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                    isInvalid={!!fieldErrors.firstName}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.firstName}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Отчество</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите отчество"
                                    value={formData.surName}
                                    onChange={(e) => handleFieldChange('surName', e.target.value)}
                                    isInvalid={!!fieldErrors.surName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.surName}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Введите email"
                                    value={formData.email}
                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                    isInvalid={!!fieldErrors.email}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.email}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Телефон *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="+7XXXXXXXXXX"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                                    isInvalid={!!fieldErrors.phoneNumber}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.phoneNumber}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Формат: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX
                                </Form.Text>
                            </Form.Group>
                        </>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Логин *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите логин"
                            value={formData.login}
                            onChange={(e) => handleFieldChange('login', e.target.value)}
                            isInvalid={!!fieldErrors.login}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.login}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Пароль *</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Введите пароль"
                            value={formData.password}
                            onChange={(e) => handleFieldChange('password', e.target.value)}
                            isInvalid={!!fieldErrors.password}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.password}
                        </Form.Control.Feedback>
                        {!isLogin && (
                            <Form.Text className="text-muted">
                                Пароль должен содержать не менее 6 символов
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                        {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </Button>
                </Form>

                <div className="text-center mt-3">
                    <Button variant="link" onClick={() => {
                        setIsLogin(!isLogin);
                        clearErrors();
                        setFormData({
                            login: '',
                            password: '',
                            secondName: '',
                            firstName: '',
                            surName: '',
                            email: '',
                            phoneNumber: ''
                        });
                    }}>
                        {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};