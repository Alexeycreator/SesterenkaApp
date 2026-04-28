import React, { useState } from 'react';
import { Card, Button, Form, Modal } from 'react-bootstrap';

import { useAuth } from '../../../../contexts/AuthContext';
import { changePassword } from '../../../../service/IndexAuth';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { clientApi } from '../../../../service/IndexAuth';

import styles from './SettingsTab.module.css';

export interface SettingsTabProps {
    currentUser?: any;
    onRefresh?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ currentUser, onRefresh }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { logout } = useAuth();

    const handleDeleteAccount = async () => {
        try {
            // TODO: API вызов для удаления аккаунта
            await clientApi.delete(currentUser?.id);
            await logout();
            window.location.href = '/';
        } catch (error) {
            console.error('Ошибка удаления аккаунта:', error);
            alert('Не удалось удалить аккаунт');
        }
    };

    return (
        <Card className={styles.contentCard}>
            <Card.Body>
                <h2 className={styles.sectionTitle}>Настройки аккаунта</h2>

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

                {/* Модальное окно подтверждения удаления */}
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

                {/* Компонент смены пароля */}
                <ChangePasswordModal
                    show={showPasswordModal}
                    onHide={() => setShowPasswordModal(false)}
                    userId={currentUser?.id}
                    userLogin={currentUser?.login}
                />
            </Card.Body>
        </Card>
    );
};