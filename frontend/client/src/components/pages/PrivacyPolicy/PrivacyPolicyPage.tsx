import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';

import { getAllPrivacyPolicy, PrivacyPolicy } from '../../servicesApi/PrivacyPolicyApi';
import LoadingSpinner from '../../LoadingSpinner';

import styles from './PrivacyPolicyPage.module.css';

const PrivacyPolicyPage = () => {
    const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        fetchPrivacyPolicy();
    }, []);

    const fetchPrivacyPolicy = async () => {
        try {
            setLoading(true);
            setError(null);
            setServerError(null);
            const data = await getAllPrivacyPolicy();
            setPrivacyPolicy(data);

            if (data && data.length > 0) {
                if (data[0].date) {
                    setLastUpdated(new Date(data[0].date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }));
                } else {
                    setLastUpdated(new Date().toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }));
                }
            }
        } catch (err: any) {
            console.error('Ошибка загрузки политики конфиденциальности:', err);
            const errorMsg = err.serverMessage || err.message || 'Не удалось загрузить политику конфиденциальности';
            setServerError(errorMsg);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Функция для разбиения текста на абзацы
    const splitContentIntoParagraphs = (content: string) => {
        if (!content) return [];
        const paragraphs = content.split(/\r?\n/).filter(p => p.trim() !== '');
        return paragraphs;
    };

    // Функция для определения, является ли строка маркированным списком
    const isBulletPoint = (text: string) => {
        const bulletPatterns = /^[-•*]\s|^\d+[.)]\s|^[а-яА-Я][.)]\s/i;
        return bulletPatterns.test(text.trim());
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error && privacyPolicy.length === 0) {
        return (
            <Container fluid className={styles.pageContainer}>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Alert variant="danger" className={styles.errorAlert} onClose={() => setError(null)} dismissible>
                            <Alert.Heading>❌ Ошибка загрузки!</Alert.Heading>
                            <p>{error}</p>
                            <hr />
                            <div className="d-flex justify-content-end">
                                <button onClick={() => fetchPrivacyPolicy()} className={styles.retryButton}>
                                    🔄 Попробовать снова
                                </button>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (privacyPolicy.length === 0) {
        return (
            <Container fluid className={styles.pageContainer}>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <div className={styles.emptyContainer}>
                            <Alert variant="warning" className={styles.warningAlert}>
                                <Alert.Heading>📄 Информация отсутствует</Alert.Heading>
                                <p>Политика конфиденциальности временно недоступна</p>
                                <hr />
                                <div className="d-flex justify-content-end">
                                    <button onClick={() => fetchPrivacyPolicy()} className={styles.retryButton}>
                                        🔄 Обновить
                                    </button>
                                </div>
                            </Alert>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container fluid className={styles.pageContainer}>
            {serverError && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger" className={styles.errorAlert} onClose={() => setServerError(null)} dismissible>
                            <Alert.Heading>⚠️ Внимание!</Alert.Heading>
                            <p>{serverError}</p>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row className="mb-5">
                <Col>
                    <h1 className={styles.title}>Политика конфиденциальности</h1>
                    <p className={styles.subtitle}>
                        Магазин «Колесо и поршень» — защита персональных данных
                    </p>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <div className={styles.updateInfo}>
                        <span className={styles.updateIcon}>📅</span>
                        Последнее обновление: {lastUpdated || 'Дата не указана'}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col lg={12}>
                    {privacyPolicy.map((section) => {
                        const paragraphs = splitContentIntoParagraphs(section.content);

                        return (
                            <div key={section.id} className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionIcon}>{section.icon || '📜'}</span>
                                    {section.title}
                                </h2>
                                <div className={styles.sectionContent}>
                                    {paragraphs.map((paragraph, idx) => {
                                        if (isBulletPoint(paragraph)) {
                                            const cleanText = paragraph.replace(/^[-•*]\s|^\d+[.)]\s|^[а-яА-Я][.)]\s/, '').trim();
                                            return (
                                                <div key={idx} className={styles.listItem}>
                                                    <span className={styles.listMarker}>•</span>
                                                    <span className={styles.listText}>{cleanText}</span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <p key={idx} className={styles.paragraph}>
                                                {paragraph}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </Col>
            </Row>

            <Row className="mt-5">
                <Col>
                    <div className={styles.contactInfo}>
                        <h3 className={styles.contactTitle}>📞 По вопросам конфиденциальности</h3>
                        <p className={styles.contactText}>
                            Если у вас возникли вопросы, связанные с обработкой персональных данных,
                            вы можете связаться с нами:
                        </p>
                        <div className={styles.contactDetails}>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>✉️</span>
                                vm96276915@gmail.com
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📱</span>
                                +7 (901) 339-95-22
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📍</span>
                                Москва, ул. Пальмовая, 13
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export { PrivacyPolicyPage };