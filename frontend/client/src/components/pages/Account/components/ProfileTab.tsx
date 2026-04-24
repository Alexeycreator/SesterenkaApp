import React, { useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';

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
    const [editedUser, setEditedUser] = useState({
        firstName: currentUser?.firstName || '',
        secondName: currentUser?.secondName || '',
        surName: currentUser?.surName || '',
        email: currentUser?.email || '',
        phoneNumber: currentUser?.phoneNumber || '',
        birthday: currentUser?.birthday || ''
    });

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    const saveProfile = async () => {
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
        } catch (error) {
            console.error('Ошибка обновления:', error);
            alert('Не удалось обновить данные');
        } finally {
            setLoading(false);
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
                    >
                        {isEditing ? 'Отмена' : '✎ Редактировать'}
                    </Button>
                </div>

                {isEditing ? (
                    <Form>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Имя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={editedUser.firstName}
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
                                        className={styles.formInput}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Отчество</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="surName"
                                        value={editedUser.surName || ''}
                                        onChange={handleInputChange}
                                        className={styles.formInput}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={editedUser.email}
                                        onChange={handleInputChange}
                                        className={styles.formInput}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Телефон</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phoneNumber"
                                        value={editedUser.phoneNumber}
                                        onChange={handleInputChange}
                                        className={styles.formInput}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={styles.formLabel}>Дата рождения</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="birthday"
                                        value={editedUser.birthday?.split('T')[0] || ''}
                                        onChange={handleInputChange}
                                        className={styles.formInput}
                                    />
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