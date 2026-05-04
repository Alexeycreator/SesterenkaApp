import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <Container fluid className={styles.pageContainer}>
            <Row className="justify-content-center align-items-center min-vh-100">
                <Col md={8} lg={6} xl={5}>
                    <div className={styles.errorContent}>
                        {/* Анимированная иллюстрация */}
                        <div className={styles.errorIllustration}>
                            <div className={styles.errorNumber}>
                                <span className={styles.digit}>4</span>
                                <div className={styles.errorIcon}>🔧</div>
                                <span className={styles.digit}>4</span>
                            </div>
                        </div>

                        {/* Текст ошибки */}
                        <h1 className={styles.errorTitle}>Страница не найдена</h1>
                        <p className={styles.errorDescription}>
                            К сожалению, страница, которую вы ищете, не существует или была перемещена.
                            Проверьте правильность введенного адреса или вернитесь на главную.
                        </p>

                        {/* Кнопки действий */}
                        <div className={styles.errorActions}>
                            <Button
                                onClick={goBack}
                                variant="outline-secondary"
                                className={styles.backButton}
                            >
                                ← Вернуться назад
                            </Button>
                            <Link to="/">
                                <Button className={styles.homeButton}>
                                    🏠 На главную
                                </Button>
                            </Link>
                        </div>

                        {/* Дополнительная информация */}
                        <div className={styles.helpInfo}>
                            <p>Возможно, вас заинтересуют эти разделы:</p>
                            <div className={styles.helpLinks}>
                                <Link to="/catalog" className={styles.helpLink}>
                                    📦 Каталог товаров
                                </Link>
                                <Link to="/information" className={styles.helpLink}>
                                    ℹ️ О компании
                                </Link>
                                <Link to="/help" className={styles.helpLink}>
                                    ❓ Помощь
                                </Link>
                                <Link to="/news" className={styles.helpLink}>
                                    📰 Новости
                                </Link>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;