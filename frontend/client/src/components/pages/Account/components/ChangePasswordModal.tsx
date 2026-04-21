import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

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

    const handleChangePassword = async () => {
        if (!userId) {
            alert('Ошибка: пользователь не авторизован');
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

        try {
            setIsChanging(true);
            await changePassword(userId, oldPassword, newPassword);

            // Обновляем токен с новым паролем
            try {
                const loginResponse = await login(userLogin || '', newPassword);
                localStorage.setItem('token', loginResponse.token);
                localStorage.setItem('user', JSON.stringify(loginResponse.user));
                setUser(loginResponse.user);

                alert('Пароль успешно изменен');
                onHide();
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } catch (loginError) {
                alert('Пароль изменен, но требуется повторный вход');
                logout();
                window.location.href = '/login';
            }
        } catch (error: any) {
            console.error('Ошибка:', error);
            if (error.statusCode === 401) {
                setOldPasswordError('Неверный текущий пароль');
            } else {
                alert(error.message || 'Не удалось изменить пароль');
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