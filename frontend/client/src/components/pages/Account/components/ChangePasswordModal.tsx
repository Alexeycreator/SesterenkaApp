import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { changePassword } from '../../../../service/user//Requests';

import styles from './ChangePasswordModal.module.css';

interface ChangePasswordModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
    userId?: number;
    userLogin?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    show,
    onHide,
    onSuccess,
    onError,
    userId,
    userLogin
}) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setWarningMessage(null);
        setFieldErrors({});
    };

    const validateForm = (): boolean => {
        const errors: typeof fieldErrors = {};

        if (!currentPassword) {
            errors.currentPassword = 'Введите текущий пароль';
        }
        if (!newPassword) {
            errors.newPassword = 'Введите новый пароль';
        } else if (newPassword.length < 6) {
            errors.newPassword = 'Пароль должен быть не менее 6 символов';
        }
        if (!confirmPassword) {
            errors.confirmPassword = 'Подтвердите новый пароль';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Пароли не совпадают';
        }

        // Проверка на совпадение старого и нового пароля - показываем Alert
        if (currentPassword && newPassword && currentPassword === newPassword) {
            setWarningMessage('Новый пароль не должен совпадать с текущим');
            return false;
        } else {
            setWarningMessage(null);
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Очищаем предыдущие предупреждения
        setWarningMessage(null);

        if (!validateForm()) {
            return;
        }

        if (!userId) {
            setError('Пользователь не авторизован');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await changePassword(userId, currentPassword, newPassword);

            resetForm();
            onHide();

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error('Ошибка смены пароля:', err);

            let errorMessage = 'Не удалось изменить пароль';

            // Обработка разных форматов ошибок
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.errors) {
                const errors = Object.values(err.response.data.errors).flat();
                errorMessage = errors.join(', ');
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);

            if (onError) {
                onError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered className={styles.modal}>
            <Modal.Header closeButton>
                <Modal.Title>Изменение пароля</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Предупреждение о совпадении паролей */}
                {warningMessage && (
                    <Alert
                        variant="danger"
                        className={styles.warningAlert}
                        onClose={() => setWarningMessage(null)}
                        dismissible
                    >
                        <Alert.Heading>⚠️ Ошибка</Alert.Heading>
                        <p>{warningMessage}</p>
                    </Alert>
                )}

                {/* Ошибка от сервера */}
                {error && (
                    <Alert variant="danger" className={styles.errorAlert} onClose={() => setError(null)} dismissible>
                        <Alert.Heading>❌ Ошибка!</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Текущий пароль *</Form.Label>
                        <div className={styles.passwordInputWrapper}>
                            <Form.Control
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value);
                                    setFieldErrors(prev => ({ ...prev, currentPassword: undefined }));
                                    setWarningMessage(null);
                                }}
                                isInvalid={!!fieldErrors.currentPassword}
                                placeholder="Введите текущий пароль"
                                className={styles.passwordInput}
                                required
                            />
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className={styles.passwordToggle}
                            >
                                {showCurrentPassword ? "🙈" : "👁️"}
                            </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.currentPassword}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Новый пароль *</Form.Label>
                        <div className={styles.passwordInputWrapper}>
                            <Form.Control
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setFieldErrors(prev => ({ ...prev, newPassword: undefined }));
                                    setWarningMessage(null);
                                }}
                                isInvalid={!!fieldErrors.newPassword}
                                placeholder="Введите новый пароль"
                                className={styles.passwordInput}
                                required
                            />
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className={styles.passwordToggle}
                            >
                                {showNewPassword ? "🙈" : "👁️"}
                            </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.newPassword}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Пароль должен содержать не менее 6 символов
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Подтверждение пароля *</Form.Label>
                        <div className={styles.passwordInputWrapper}>
                            <Form.Control
                                type={showNewPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                    setWarningMessage(null);
                                }}
                                isInvalid={!!fieldErrors.confirmPassword}
                                placeholder="Повторите новый пароль"
                                className={styles.passwordInput}
                                required
                            />
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.confirmPassword}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex gap-2 mt-3">
                        <Button variant="secondary" onClick={handleClose} disabled={loading} className="flex-grow-1">
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};