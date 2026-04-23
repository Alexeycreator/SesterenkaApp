import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import styles from './InformationPage.module.css';
import { useNavigate } from 'react-router-dom';
import { getInformations, Information } from '../../servicesApi/InformationsApi';
import { Address, getAddressById } from '../../servicesApi/AddressesApi';
import { getUserById, User } from '../../servicesApi/UsersApi';

const InformationPage = () => {
    const navigate = useNavigate();

    // состояния информации
    const [informationData, setInformationData] = useState<Information[] | null>();
    const [loadingInfromation, setLoadingInformation] = useState(true);
    const [errorInformation, setErrorInfromation] = useState<string | null>(null);

    const [infoAboutUs, setInfoAboutUs] = useState<string[]>([]);
    const [infoQuestions, setInfoQuestions] = useState<string>();
    const [infoUsers, setInfoUsers] = useState<(number | null | undefined)[]>();
    const [infoAddresses, setInfoAddresses] = useState<(number | null | undefined)[]>();

    // состояния сотрудников
    const [usersEmployee, setUsersEmployee] = useState<User[] | null>([]);
    const [loadingUsersEmployee, setLoadingUsersEmployee] = useState(true);
    const [errorUsersEmployee, setErrorUsersEmployee] = useState<string | null>(null);

    // состояние адресов
    const [addressShops, setAddressShops] = useState<Address[] | null>([]);
    const [loadingAddressShops, setLoadingAddressShops] = useState(true);
    const [errorAddressShops, setErrorAddressShops] = useState<string | null>(null);

    const fetchInformation = async () => {
        try {
            setLoadingInformation(true);
            const informationData = await getInformations();
            setInformationData(informationData);
            if (setErrorInfromation.length > 0) {
                let iAboutUs = informationData[0]?.aboutUs ?? '';
                const aboutUsParts = iAboutUs.split(/\s*;\s*/).filter(part => part.trim() !== '');
                setInfoAboutUs(aboutUsParts)

                let iQuestions = informationData[0]?.questions ?? '';
                setInfoQuestions(iQuestions);

                let iUsers = informationData.map(users => users.users_Id);
                setInfoUsers(iUsers);

                let iAddresses = informationData.map(addresses => addresses.addresses_Id);
                setInfoAddresses(iAddresses);
            }
            else {
                console.warn("Данные пустые");
            }
        }
        catch (err: any) {
            console.error('Ошибка загрузки страницы информации:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorInfromation(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorInfromation(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorInfromation('Ошибка соединения с сервером');
            }
        }
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsersEmployee(true);
            if (infoUsers && infoUsers.length > 0) {
                const user = await Promise.all(
                    infoUsers.map(id => getUserById(Number(id)))
                );
                setUsersEmployee(user);
                console.log("Users: ", user);
            }
        }
        catch (err: any) {
            console.error('Ошибка загрузки страницы информации:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorUsersEmployee(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorUsersEmployee(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorUsersEmployee('Ошибка соединения с сервером');
            }
        }
    };

    const fetchAddresses = async () => {
        try {
            setLoadingAddressShops(true);
            if (infoAddresses && infoAddresses.length > 0) {
                const addresses = await Promise.all(
                    infoAddresses.map(id => getAddressById(Number(id)))
                );
                setAddressShops(addresses);
                console.log("Address: ", addresses);
            }
        }
        catch (err: any) {
            console.error('Ошибка загрузки страницы информации:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorAddressShops(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorAddressShops(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorAddressShops('Ошибка соединения с сервером');
            }
        }
    };

    useEffect(() => {
        fetchInformation();
    }, []);

    useEffect(() => {
        if (infoUsers && infoUsers.length > 0) {
            fetchUsers();
        }
    }, [infoUsers]);

    useEffect(() => {
        if (infoAddresses && infoAddresses.length > 0) {
            fetchAddresses();
        }
    }, [infoAddresses]);

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

            {/* О компании */}
            <Row className="mb-5">
                <Col>
                    <div className={styles.infoBlock}>
                        <h2 className={styles.sectionTitle}>🚗 О нас</h2>
                        <p className={styles.companyDescription}>{infoAboutUs[0]}</p>
                        <p className={styles.companyMission}>{`Наша миссия — ${infoAboutUs[1]}`}</p>
                        <h3 className={styles.valuesTitle}>Наши ценности</h3>
                        <div className={styles.valuesGrid}>
                            {Object.values(infoAboutUs).slice(2).map((value, index) => (
                                <div key={index} className={styles.valueItem}>
                                    <span className={styles.valueDot}>•</span>
                                    <span className={styles.valueText}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Команда */}
            <Row className="mb-5">
                <Col>
                    <h2 className={styles.sectionTitle}>👥 Наша команда</h2>
                </Col>
            </Row>
            <Row xs={1} md={2} lg={4} className="g-4 mb-5 justify-content-center">
                {usersEmployee?.map((user, index) => (
                    <Col key={index}>
                        <div className={styles.teamCard}>
                            <div className={styles.teamIcon}>
                                {"👨‍💼"}{/* {user.icon} */}
                            </div>
                            <h3 className={styles.teamName}>
                                {`${user.secondName} ${user.firstName}`}
                            </h3>
                            <div className={styles.teamPosition}>
                                {user.position}
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Магазины */}
            <Row className="mb-4">
                <Col>
                    <h2 className={styles.sectionTitle}>🏪 Наши магазины</h2>
                </Col>
            </Row>
            <Row xs={1} md={2} lg={3} className="g-4 mb-5 justify-content-center">
                {addressShops?.map((store, index) => {
                    return (
                        <Col key={index}>
                            <div className={styles.storeCard}>
                                <h3 className={styles.storeCity}>{store.city}</h3>
                                <div className={styles.storeAddress}>
                                    <span className={styles.storeIcon}>📍</span>
                                    {`ул. ${store.street}, д. ${store.house}`}
                                </div>
                                <div className={styles.storeSchedule}>
                                    <span className={styles.storeIcon}>🕐</span>
                                    Круглосуточно
                                </div>
                            </div>
                        </Col>
                    )
                })}
            </Row>

            {/* Дополнительная информация */}
            <Row className="mb-4">
                <Col>
                    <div className={styles.extraInfo}>
                        <h3 className={styles.extraTitle}>Почему выбирают нас?</h3>
                        <p className={styles.extraText}>
                            {infoQuestions}
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export { InformationPage };