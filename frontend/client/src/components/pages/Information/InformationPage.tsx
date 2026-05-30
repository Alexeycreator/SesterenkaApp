import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { getInformations } from '../../servicesApi/InformationsApi';
import LoadingSpinner from '../../LoadingSpinner';

import styles from './InformationPage.module.css';

// Кэш для данных (за пределами компонента)
let cachedData: any = null;
let isLoading = false;
let isInitialized = false;

const InformationPage = () => {
    const navigate = useNavigate();

    // состояния информации
    const [loadingInformation, setLoadingInformation] = useState(!cachedData); // ← Используем кэш для начального состояния
    const [errorInformation, setErrorInformation] = useState<string | null>(null);

    // данные для отображения
    const [aboutUsList, setAboutUsList] = useState<string[]>(cachedData?.aboutUs || []);
    const [questionsList, setQuestionsList] = useState<string[]>(cachedData?.questions || []);
    const [ourMissionList, setOurMissionList] = useState<string[]>(cachedData?.ourMission || []);
    const [ourValuesList, setOurValuesList] = useState<string[]>(cachedData?.ourValues || []);
    const [employees, setEmployees] = useState<any[]>(cachedData?.usersInfo || []);
    const [shops, setShops] = useState<any[]>(() => {
        if (cachedData?.addressesInfo) {
            return cachedData.addressesInfo.filter((addr: any) => addr.isShop === true);
        }
        return [];
    });

    const isMounted = useRef(true);
    const isInitialMount = useRef(true);

    // Функция для обновления состояния из данных
    const updateStateFromData = (data: any) => {
        if (!isMounted.current) return;

        setAboutUsList(data.aboutUs || []);
        setQuestionsList(data.questions || []);
        setOurMissionList(data.ourMission || []);
        setOurValuesList(data.ourValues || []);
        setEmployees(data.usersInfo || []);

        const shopAddresses = (data.addressesInfo || []).filter((addr: any) => addr.isShop === true);
        setShops(shopAddresses);
    };

    const fetchInformation = async (forceRefresh: boolean = false) => {
        // Если данные уже загружены и не принудительное обновление, используем кэш
        if (cachedData !== null && !forceRefresh && isInitialized) {
            if (isMounted.current) {
                updateStateFromData(cachedData);
                setLoadingInformation(false);
            }
            return;
        }

        // Если уже идет загрузка, ждем
        if (isLoading) return;

        isLoading = true;
        if (isMounted.current) {
            setLoadingInformation(true);
            setErrorInformation(null);
        }

        try {
            const data = await getInformations();

            if (data && data.length > 0) {
                const firstItem = data[0];

                // Сохраняем в кэш
                cachedData = firstItem;
                isInitialized = true;

                if (isMounted.current) {
                    updateStateFromData(firstItem);
                    setErrorInformation(null);
                }
            }
        } catch (err: any) {
            console.error('Ошибка загрузки страницы информации:', err);
            if (isMounted.current) {
                if (err.code === 'ERR_BAD_REQUEST') {
                    if (err.response?.status === 404) {
                        setErrorInformation('Информация не найдена');
                        navigate('/404', { replace: true });
                    } else {
                        const errorMsg = err.response?.data?.message || err.message || 'Ошибка загрузки данных';
                        setErrorInformation(errorMsg);
                    }
                } else {
                    setErrorInformation('Ошибка соединения с сервером');
                }
            }
        } finally {
            isLoading = false;
            if (isMounted.current) {
                setLoadingInformation(false);
            }
        }
    };

    useEffect(() => {
        isMounted.current = true;

        // Загружаем данные только если кэш пуст или это первый монтирование
        if (!cachedData || !isInitialized) {
            fetchInformation();
        } else {
            // Если кэш есть, но состояние загрузки true, сбрасываем его
            if (loadingInformation) {
                setLoadingInformation(false);
            }
        }

        // Слушаем событие обновления данных
        const handleDataUpdate = () => {
            if (isMounted.current) {
                // Сбрасываем кэш при обновлении
                cachedData = null;
                isInitialized = false;
                fetchInformation(true);
            }
        };

        window.addEventListener('authChange', handleDataUpdate);
        window.addEventListener('categoriesUpdated', handleDataUpdate);

        return () => {
            isMounted.current = false;
            window.removeEventListener('authChange', handleDataUpdate);
            window.removeEventListener('categoriesUpdated', handleDataUpdate);
        };
    }, []); // Пустой массив зависимостей

    // Эффект для обновления при навигации (без перезагрузки страницы)
    useEffect(() => {
        // Сбрасываем загрузку при монтировании
        if (cachedData && !loadingInformation) {
            setLoadingInformation(false);
        }
    }, []);

    if (loadingInformation) {
        return <LoadingSpinner />;
    }

    if (errorInformation) {
        return (
            <Container fluid className={styles.pageContainer}>
                <Alert variant="danger" className={styles.errorAlert} onClose={() => setErrorInformation(null)} dismissible>
                    <Alert.Heading>❌ Ошибка загрузки!</Alert.Heading>
                    <p>{errorInformation}</p>
                </Alert>
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
                                    {ourMissionList[0]}
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
                        {[...employees]
                            .sort((a, b) => {
                                if (a.position === 'администратор' && b.position !== 'администратор') {
                                    return -1
                                };
                                if (a.position !== 'администратор' && b.position === 'администратор') {
                                    return 1;
                                }
                                return 0;
                            })
                            .map((user, index) => (
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