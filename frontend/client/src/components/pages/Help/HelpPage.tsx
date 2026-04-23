import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from 'react-bootstrap';

import { getShopAddress, AddressOrder } from '../../servicesApi/AddressesApi';
import { getUsers, User } from '../../servicesApi/UsersApi';

import styles from './HelpPage.module.css';

const HelpPage = () => {
    // Состояния для динамических данных
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [shopAddress, setShopAddress] = useState<AddressOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Параллельно загружаем пользователей и адреса
                const [users, addresses] = await Promise.all([
                    getUsers(),
                    getShopAddress()
                ]);

                // Находим первого пользователя с ролью admin
                const admin = users.find(user => user.role === 'admin');
                setAdminUser(admin || null);

                // Берем первый адрес магазина
                if (addresses && addresses.length > 0) {
                    setShopAddress(addresses[0]);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных для страницы помощи:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const faqItems = [
        {
            question: "Как оформить заказ?",
            answer: "Выберите товар в каталоге, добавьте его в корзину и перейдите к оформлению заказа. Заполните контактные данные и выберите способ доставки."
        },
        {
            question: "Какие способы оплаты доступны?",
            answer: "Оплата производится наличными при получении в магазине. На данный момент другие способы оплаты временно недоступны."
        },
        {
            question: "Как отследить мой заказ?",
            answer: "После отправки заказа вы получите SMS и email с трек-номером. Отслеживать посылку можно на сайте транспортной компании или в личном кабинете."
        },
        {
            question: "Какая гарантия на товары?",
            answer: "На все товары предоставляется гарантия от производителя от 1 до 3 лет. Подробные условия указаны в гарантийном талоне."
        },
        {
            question: "Как вернуть товар?",
            answer: "Для возврата товара заполните заявление и обратитесь в наш сервисный центр или свяжитесь с поддержкой."
        },
        {
            question: "Сколько времени занимает доставка?",
            answer: "Доставка по Москве занимает 1-2 дня, по России - от 3 до 7 дней в зависимости от региона и выбранной транспортной компании."
        }
    ];

    const returnSteps = [
        {
            step: 1,
            title: "Заполните заявление",
            description: "Скачайте бланк заявления на возврат или заполните его в нашем офисе"
        },
        {
            step: 2,
            title: "Подготовьте товар",
            description: "Товар должен быть в оригинальной упаковке, без следов использования"
        },
        {
            step: 3,
            title: "Передайте товар",
            description: "Привезите товар в наш офис или отправьте транспортной компанией"
        },
        {
            step: 4,
            title: "Получите деньги",
            description: "Деньги будут возвращены в течение 3-5 рабочих дней"
        }
    ];

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-5">
                <Col>
                    <h1 className={styles.title}>Помощь и поддержка</h1>
                    <p className={styles.subtitle}>
                        Ответы на частые вопросы и способы связи с нами
                    </p>
                </Col>
            </Row>

            {/* Каналы поддержки */}
            <Row className="mb-5">
                <Col>
                    <h2 className={styles.sectionTitle}>📞 Связаться с нами</h2>
                </Col>
            </Row>
            <Row xs={1} md={3} className="g-4 mb-5">
                {/* Телефон поддержки */}
                <Col>
                    <div className={styles.supportCard}>
                        <div className={styles.supportIcon}>📞</div>
                        <h3 className={styles.supportTitle}>Телефон поддержки</h3>
                        <div className={styles.supportContent}>
                            {loading ? 'Загрузка...' : (adminUser?.phoneNumber || '+7 (901) 339-95-22')}
                        </div>
                        <div className={styles.supportDescription}>Ежедневно с 8:00 до 22:00</div>
                    </div>
                </Col>

                {/* Email */}
                <Col>
                    <div className={styles.supportCard}>
                        <div className={styles.supportIcon}>✉️</div>
                        <h3 className={styles.supportTitle}>Email</h3>
                        <div className={styles.supportContent}>
                            {loading ? 'Загрузка...' : (adminUser?.email || 'info@koleso-porshen.ru')}
                        </div>
                        <div className={styles.supportDescription}>Ответим в течение 2 часов</div>
                    </div>
                </Col>

                {/* Адрес офиса */}
                <Col>
                    <div className={styles.supportCard}>
                        <div className={styles.supportIcon}>📍</div>
                        <h3 className={styles.supportTitle}>Офис в {loading ? '...' : (shopAddress?.city || 'Москве')}</h3>
                        <div className={styles.supportContent}>
                            {loading ? 'Загрузка...' : (shopAddress ? `ул. ${shopAddress.street}, д. ${shopAddress.house}` : 'ул. Пальмовая, 13')}
                        </div>
                        <div className={styles.supportDescription}>
                            Круглосуточно
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Часто задаваемые вопросы */}
            <Row className="mb-4">
                <Col>
                    <h2 className={styles.sectionTitle}>❓ Часто задаваемые вопросы</h2>
                </Col>
            </Row>
            <Row xs={1} md={2} className="g-4 mb-5">
                {faqItems.map((item, index) => (
                    <Col key={index}>
                        <div className={styles.faqItem}>
                            <h3 className={styles.faqQuestion}>{item.question}</h3>
                            <p className={styles.faqAnswer}>{item.answer}</p>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Возврат товара */}
            <Row className="mb-4">
                <Col>
                    <h2 className={styles.sectionTitle}>🔄 Возврат товара</h2>
                </Col>
            </Row>
            <Row className="mb-5">
                <Col>
                    <div className={styles.returnInfo}>
                        <p className={styles.returnText}>
                            Вы можете вернуть товар в течение 14 дней с момента покупки,
                            если он не был в употреблении и сохранены все упаковки и ярлыки.
                            Оплата производится наличными при получении в магазине.
                        </p>
                    </div>
                </Col>
            </Row>
            <Row xs={1} md={2} lg={4} className="g-4 mb-5">
                {returnSteps.map((step) => (
                    <Col key={step.step}>
                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>{step.step}</div>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDescription}>{step.description}</p>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Дополнительная информация */}
            <Row className="mb-4">
                <Col>
                    <div className={styles.additionalInfo}>
                        <h3 className={styles.additionalTitle}>Не нашли ответ на свой вопрос?</h3>
                        <p className={styles.additionalText}>
                            Свяжитесь с нами любым удобным способом, и мы обязательно поможем!
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export { HelpPage };