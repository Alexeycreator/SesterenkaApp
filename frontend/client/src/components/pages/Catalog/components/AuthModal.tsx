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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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
            setError(err.serverMessage || 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered className={styles.authModal}>
            <Modal.Header closeButton>
                <Modal.Title>{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Фамилия</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите фамилию"
                                    value={formData.secondName}
                                    onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Имя</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите имя"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Введите email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Телефон</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Введите телефон"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>Логин</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите логин"
                            value={formData.login}
                            onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Введите пароль"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                        {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};