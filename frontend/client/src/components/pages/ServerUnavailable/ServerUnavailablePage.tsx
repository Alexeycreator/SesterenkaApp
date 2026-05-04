import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import styles from './ServerUnavailablePage.module.css';

const ServerUnavailablePage: React.FC = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <Container fluid className={styles.pageContainer}>
            <Row className="justify-content-center align-items-center min-vh-100">
                <Col md={8} lg={6} className="text-center">
                    <div className={styles.errorIcon}>🔧</div>
                    <h1 className={styles.title}>Технические работы</h1>
                    <p className={styles.message}>
                        В настоящее время сервер недоступен. Возможно, ведутся технические работы.
                    </p>
                    <p className={styles.submessage}>
                        Пожалуйста, попробуйте зайти позже. Приносим извинения за временные неудобства.
                    </p>
                    <div className={styles.buttonGroup}>
                        <Button
                            onClick={handleRetry}
                            className={styles.retryButton}
                        >
                            🔄 Попробовать снова
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ServerUnavailablePage;