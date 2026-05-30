import React, { useState } from 'react';
import { Card, Button, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../../contexts/AuthContext';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { clientApi } from '../../../../service/IndexAuth';

import styles from './SettingsTab.module.css';

export interface SettingsTabProps {
    currentUser?: any;
    onRefresh?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ currentUser, onRefresh }) => {
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { logout } = useAuth();

    const showError = (message: string) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 5000);
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleDeleteAccount = async () => {
        setErrorMessage(null);
        try {
            await clientApi.delete(currentUser?.id);
            showSuccess('Аккаунт успешно удален');
            setTimeout(() => {
                logout();
                navigate('/');
            }, 1500);
        } catch (error: any) {
            console.error('Ошибка удаления аккаунта:', error);
            const msg = error.serverMessage || error.message || 'Не удалось удалить аккаунт';
            showError(msg);
            setShowDeleteConfirm(false);
        }
    };

    const handlePasswordChangeSuccess = () => {
        showSuccess('Пароль успешно изменен');
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            logout();
            window.dispatchEvent(new CustomEvent('authChange', { detail: { user: null } }));
            navigate('/', { replace: true });
        }, 1500);
    };

    const handlePasswordChangeError = (error: any) => {
        console.error('Ошибка смены пароля:', error);
        if (error.response?.data?.message) {
            showError(error.response.data.message);
        } else if (error.message) {
            showError(error.message);
        } else {
            showError('Не удалось изменить пароль. Попробуйте позже.');
        }
    };

    const handleCloseError = () => setErrorMessage(null);
    const handleCloseSuccess = () => setSuccessMessage(null);

    return (
        <Card className={styles.contentCard}>
            <Card.Body>
                <h2 className={styles.sectionTitle}>Настройки аккаунта</h2>

                {successMessage && (
                    <Alert variant="success" className={styles.successAlert} onClose={handleCloseSuccess} dismissible>
                        <Alert.Heading>✅ Успешно!</Alert.Heading>
                        <p>{successMessage}</p>
                    </Alert>
                )}
                {errorMessage && (
                    <Alert variant="danger" className={styles.errorAlert} onClose={handleCloseError} dismissible>
                        <Alert.Heading>❌ Ошибка!</Alert.Heading>
                        <p>{errorMessage}</p>
                    </Alert>
                )}

                <div className={styles.settingsSection}>
                    <h3 className={styles.settingsSubtitle}>Безопасность</h3>
                    <Button
                        className={styles.changePasswordButton}
                        onClick={() => setShowPasswordModal(true)}
                    >
                        Изменить пароль
                    </Button>
                </div>

                <div className={styles.settingsSection}>
                    <h3 className={styles.settingsSubtitle}>Удаление аккаунта</h3>
                    <p className={styles.deleteWarning}>
                        После удаления аккаунта все ваши данные будут безвозвратно удалены
                    </p>
                    <Button
                        className={styles.deleteAccountButton}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        Удалить аккаунт
                    </Button>
                </div>

                <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Удаление аккаунта</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Вы действительно хотите удалить свой аккаунт?</p>
                        <p className={styles.warningText}>⚠️ Это действие необратимо.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                            Отмена
                        </Button>
                        <Button variant="danger" onClick={handleDeleteAccount}>
                            Удалить
                        </Button>
                    </Modal.Footer>
                </Modal>

                <ChangePasswordModal
                    show={showPasswordModal}
                    onHide={() => setShowPasswordModal(false)}
                    onSuccess={handlePasswordChangeSuccess}
                    onError={handlePasswordChangeError}
                    userId={currentUser?.id}
                    userLogin={currentUser?.login}
                />
            </Card.Body>
        </Card>
    );
};