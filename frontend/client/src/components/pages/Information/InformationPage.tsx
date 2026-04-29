import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { getInformations } from '../../servicesApi/InformationsApi';

import styles from './InformationPage.module.css';
import LoadingSpinner from '../../LoadingSpinner';

const InformationPage = () => {
    const navigate = useNavigate();

    // состояния информации
    const [loadingInformation, setLoadingInformation] = useState(true);
    const [errorInformation, setErrorInformation] = useState<string | null>(null);

    // данные для отображения
    const [aboutUsList, setAboutUsList] = useState<string[]>([]);
    const [questionsList, setQuestionsList] = useState<string[]>([]);
    const [ourMissionList, setOurMissionList] = useState<string[]>([]);
    const [ourValuesList, setOurValuesList] = useState<string[]>([]);

    // сотрудники и адреса
    const [employees, setEmployees] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]);

    const fetchInformation = async () => {
        try {
            setLoadingInformation(true);
            const data = await getInformations();

            if (data && data.length > 0) {
                const firstItem = data[0];

                if (firstItem.aboutUs && firstItem.aboutUs.length > 0) {
                    setAboutUsList(firstItem.aboutUs);
                }

                if (firstItem.questions && firstItem.questions.length > 0) {
                    setQuestionsList(firstItem.questions);
                }

                if (firstItem.ourMission && firstItem.ourMission.length > 0) {
                    setOurMissionList(firstItem.ourMission);
                }

                if (firstItem.ourValues && firstItem.ourValues.length > 0) {
                    setOurValuesList(firstItem.ourValues);
                }

                if (firstItem.usersInfo && firstItem.usersInfo.length > 0) {
                    setEmployees(firstItem.usersInfo);
                }

                if (firstItem.addressesInfo && firstItem.addressesInfo.length > 0) {
                    const shopAddresses = firstItem.addressesInfo.filter(addr => addr.isShop === true);
                    setShops(shopAddresses);
                }
            }
        } catch (err: any) {
            console.error('Ошибка загрузки страницы информации:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    setErrorInformation('Информация не найдена');
                    navigate('/404', { replace: true });
                } else {
                    setErrorInformation(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorInformation('Ошибка соединения с сервером');
            }
        } finally {
            setLoadingInformation(false);
        }
    };

    useEffect(() => {
        fetchInformation();
    }, []);

    if (loadingInformation) {
        return (
            <LoadingSpinner />
        );
    }

    if (errorInformation) {
        return (
            <Container fluid className={styles.pageContainer}>
                <div className={styles.error}>{errorInformation}</div>
            </Container>
        );
    }

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-5">
                <Col>
                    <h1 className={styles.title}>О компании «Колесо и поршень»</h1>
                    <p className={styles.subtitle}>
                        Ваш надежный партнер в мире автозапчастей с 2015 года
                    </p>
                </Col>
            </Row>

            {/* О нас - AboutUs */}
            {aboutUsList.length > 0 && (
                <Row className="mb-5">
                    <Col>
                        <div className={styles.infoBlock}>
                            <h2 className={styles.sectionTitle}>🚗 О нас</h2>
                            <p className={styles.companyDescription}>{aboutUsList[0]}</p>

                            {/* Миссия - OurMission */}
                            {ourMissionList.length > 0 && (
                                <p className={styles.companyMission}>
                                    Наша миссия — {ourMissionList[0]}
                                </p>
                            )}

                            {/* Ценности - OurValues */}
                            {ourValuesList.length > 0 && (
                                <>
                                    <h3 className={styles.valuesTitle}>Наши ценности</h3>
                                    <div className={styles.valuesGrid}>
                                        {ourValuesList.map((value, index) => (
                                            <div key={index} className={styles.valueItem}>
                                                <span className={styles.valueDot}>•</span>
                                                <span className={styles.valueText}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </Col>
                </Row>
            )}

            {/* Вопросы и ответы */}
            {questionsList.length > 0 && (
                <Row className="mb-5">
                    <Col>
                        <h2 className={styles.sectionTitle}>❓ Часто задаваемые вопросы</h2>
                        <div className={styles.faqBlock}>
                            {questionsList.map((question, index) => (
                                <div key={index} className={styles.faqItem}>
                                    <div className={styles.questionHeader}>
                                        <span className={styles.questionIcon}>❓</span>
                                        <h3 className={styles.questionTitle}>Почему выбирают нас?</h3>
                                    </div>
                                    <div className={styles.questionContent}>
                                        <span className={styles.answerIcon}>📝</span>
                                        <p className={styles.questionText}>{question}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>
            )}

            {/* Команда - сотрудники */}
            {employees.length > 0 && (
                <>
                    <Row className="mb-4">
                        <Col>
                            <h2 className={styles.sectionTitle}>👥 Наша команда</h2>
                        </Col>
                    </Row>
                    <Row xs={1} md={2} lg={4} className="g-4 mb-5 justify-content-center">
                        {employees.map((user, index) => (
                            <Col key={user.id || index}>
                                <div className={styles.teamCard}>
                                    <div className={styles.teamIcon}>
                                        {user.gender === 'Женский' ? '👩‍💼' : '👨‍💼'}
                                    </div>
                                    <h3 className={styles.teamName}>
                                        {`${user.secondName} ${user.firstName}`}
                                    </h3>
                                    <div className={styles.teamPosition}>
                                        {user.position === 'администратор' ? 'администратор' : (user.position || 'сотрудник')}
                                    </div>
                                    {user.email && (
                                        <div className={styles.teamEmailWrapper}>
                                            <span className={styles.teamEmailIcon}>📧</span>
                                            <div className={styles.teamEmail} title={user.email}>
                                                {user.email}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* Магазины */}
            {shops.length > 0 && (
                <>
                    <Row className="mb-4">
                        <Col>
                            <h2 className={styles.sectionTitle}>🏪 Наши магазины</h2>
                        </Col>
                    </Row>
                    <Row xs={1} md={2} lg={3} className="g-4 mb-5 justify-content-center">
                        {shops.map((store, index) => (
                            <Col key={store.id || index}>
                                <div className={styles.storeCard}>
                                    <h3 className={styles.storeCity}>{store.city}</h3>
                                    <div className={styles.storeAddress}>
                                        <span className={styles.storeIcon}>📍</span>
                                        <span>{`ул. ${store.street}, д. ${store.house || ''}`}</span>
                                    </div>
                                    <div className={styles.storeSchedule}>
                                        <span className={styles.storeIcon}>🕐</span>
                                        <span>Круглосуточно</span>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Container>
    );
};

export { InformationPage };