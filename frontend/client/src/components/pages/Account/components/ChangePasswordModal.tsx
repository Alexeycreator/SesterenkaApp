import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

import { useAuth } from '../../../../contexts/AuthContext';
import { changePassword } from '../../../../service/IndexAuth';

import styles from './ChangePasswordModal.module.css';

interface ChangePasswordModalProps {
    show: boolean;
    onHide: () => void;
    userId?: number;
    userLogin?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    show, onHide, userId, userLogin
}) => {
    const { login, logout, setUser } = useAuth();
    const [isChanging, setIsChanging] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const showError = (message: string) => {
        setServerError(message);
        setTimeout(() => setServerError(null), 5000);
    };

    const handleChangePassword = async () => {
        if (!userId) {
            showError('Ошибка: пользователь не авторизован');
            return;
        }

        // Валидация
        if (!oldPassword) {
            setOldPasswordError('Введите текущий пароль');
            return;
        }
        if (!newPassword) {
            setNewPasswordError('Введите новый пароль');
            return;
        }
        if (newPassword.length < 6) {
            setNewPasswordError('Пароль должен быть не менее 6 символов');
            return;
        }
        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Пароли не совпадают');
            return;
        }

        setServerError(null);
        setIsChanging(true);

        try {
            await changePassword(userId, oldPassword, newPassword);

            // Обновляем токен с новым паролем
            try {
                const loginResponse = await login(userLogin || '', newPassword);
                localStorage.setItem('token', loginResponse.token);
                localStorage.setItem('user', JSON.stringify(loginResponse.user));
                setUser(loginResponse.user);

                showSuccess('Пароль успешно изменен');
                setTimeout(() => {
                    onHide();
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }, 1500);
            } catch (loginError) {
                showError('Пароль изменен, но требуется повторный вход');
                setTimeout(() => {
                    logout();
                    window.location.href = '/login';
                }, 2000);
            }
        } catch (error: any) {
            console.error('Ошибка:', error);
            if (error.statusCode === 401) {
                setOldPasswordError('Неверный текущий пароль');
            } else if (error.serverMessage) {
                showError(error.serverMessage);
            } else if (error.message) {
                showError(error.message);
            } else {
                showError('Не удалось изменить пароль');
            }
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Изменение пароля</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Уведомления */}
                {successMessage && (
                    <Alert variant="success" className={styles.successAlert} onClose={() => setSuccessMessage(null)} dismissible>
                        <Alert.Heading>✅ Успешно!</Alert.Heading>
                        <p>{successMessage}</p>
                    </Alert>
                )}
                {serverError && (
                    <Alert variant="danger" className={styles.errorAlert} onClose={() => setServerError(null)} dismissible>
                        <Alert.Heading>❌ Ошибка!</Alert.Heading>
                        <p>{serverError}</p>
                    </Alert>
                )}

                <Form>
                    {/* Старый пароль */}
                    <Form.Group className="mb-3">
                        <Form.Label>Текущий пароль *</Form.Label>
                        <div className={styles.passwordInputWrapper}>
                            <Form.Control
                                type={showOldPassword ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => {
                                    setOldPassword(e.target.value);
                                    setOldPasswordError('');
                                    setServerError(null);
                                }}
                                placeholder="Введите текущий пароль"
                                isInvalid={!!oldPasswordError}
                                className={styles.passwordInput}
                            />
                            <Button
                                variant="link"
                                className={styles.passwordToggle}
                                onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                                {showOldPassword ? '🙈' : '👁️'}
                            </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {oldPasswordError}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Новый пароль */}
                    <Form.Group className="mb-3">
                        <Form.Label>Новый пароль *</Form.Label>
                        <div className={styles.passwordInputWrapper}>
                            <Form.Control
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setNewPasswordError('');
                                    setServerError(null);
                                }}
                                placeholder="Введите новый пароль"
                                isInvalid={!!newPasswordError}
                                className={styles.passwordInput}
                            />
                            <Button
                                variant="link"
                                className={styles.passwordToggle}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? '🙈' : '👁️'}
                            </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {newPasswordError}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Пароль должен содержать не менее 6 символов
                        </Form.Text>
                    </Form.Group>

                    {/* Подтверждение пароля */}
                    <Form.Group className="mb-3">
                        <Form.Label>Подтверждение пароля *</Form.Label>
                        <div className={styles.passwordInputWrapper}>
                            <Form.Control
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setConfirmPasswordError('');
                                    setServerError(null);
                                }}
                                placeholder="Повторите новый пароль"
                                isInvalid={!!confirmPasswordError}
                                className={styles.passwordInput}
                            />
                            <Button
                                variant="link"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {confirmPasswordError}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Отмена
                </Button>
                <Button
                    variant="primary"
                    onClick={handleChangePassword}
                    disabled={isChanging}
                >
                    {isChanging ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};