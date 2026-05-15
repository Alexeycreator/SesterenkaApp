import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';

import { getAllTermsOfUse, TermsOfUse } from '../../servicesApi/TermsOfUseApi';
import LoadingSpinner from '../../LoadingSpinner';

import styles from './TermsOfUsePage.module.css';

const TermsOfUsePage = () => {
    const [termsOfUse, setTermsOfUse] = useState<TermsOfUse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        fetchTermsOfUse();
    }, []);

    const fetchTermsOfUse = async () => {
        try {
            setLoading(true);
            setError(null);
            setServerError(null);
            const data = await getAllTermsOfUse();
            setTermsOfUse(data);

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
            console.error('Ошибка загрузки пользовательского соглашения:', err);
            const errorMsg = err.serverMessage || err.message || 'Не удалось загрузить пользовательское соглашение';
            setServerError(errorMsg);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Функция для разбиения текста на абзацы
    const splitContentIntoParagraphs = (content: string) => {
        if (!content) return [];
        // Разбиваем по \r\n, \n, и удаляем пустые строки
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

    if (error && termsOfUse.length === 0) {
        return (
            <Container fluid className={styles.pageContainer}>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Alert variant="danger" className={styles.errorAlert} onClose={() => setError(null)} dismissible>
                            <Alert.Heading>❌ Ошибка загрузки!</Alert.Heading>
                            <p>{error}</p>
                            <hr />
                            <div className="d-flex justify-content-end">
                                <button onClick={() => fetchTermsOfUse()} className={styles.retryButton}>
                                    🔄 Попробовать снова
                                </button>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (termsOfUse.length === 0) {
        return (
            <Container fluid className={styles.pageContainer}>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <div className={styles.emptyContainer}>
                            <Alert variant="warning" className={styles.warningAlert}>
                                <Alert.Heading>📄 Информация отсутствует</Alert.Heading>
                                <p>Пользовательское соглашение временно недоступно</p>
                                <hr />
                                <div className="d-flex justify-content-end">
                                    <button onClick={() => fetchTermsOfUse()} className={styles.retryButton}>
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
            {/* Отображение ошибки от сервера (если есть, но данные загружены частично) */}
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

            {/* Заголовок */}
            <Row className="mb-5">
                <Col>
                    <h1 className={styles.title}>Пользовательское соглашение</h1>
                    <p className={styles.subtitle}>
                        Магазин «Колесо и поршень» — правила использования сайта
                    </p>
                </Col>
            </Row>

            {/* Дата обновления */}
            <Row className="mb-4">
                <Col>
                    <div className={styles.updateInfo}>
                        <span className={styles.updateIcon}>📅</span>
                        Последнее обновление: {lastUpdated || 'Дата не указана'}
                    </div>
                </Col>
            </Row>

            {/* Секции соглашения */}
            <Row>
                <Col lg={12}>
                    {termsOfUse.map((section) => {
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
                                            const cleanText = paragraph.replace(/^[-•*]\s|^\d+[.)]\s|^[а-яА-Я][.)]\s/, '');
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

            {/* Согласие */}
            <Row className="mt-5">
                <Col>
                    <div className={styles.agreementInfo}>
                        <h3 className={styles.agreementTitle}>✓ Принимаю условия</h3>
                        <p className={styles.agreementText}>
                            Используя сайт «Колесо и поршень», вы подтверждаете, что ознакомились
                            с условиями настоящего пользовательского соглашения и принимаете их.
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export { TermsOfUsePage };