import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './MainPage.module.css';

const MainPage = () => {
    const categories = [
        { icon: '🛢️', name: 'Масляные фильтры', link: '/catalog?category=oil-filters' },
        { icon: '🌬️', name: 'Салонные фильтры', link: '/catalog?category=cabin-filters' },
        { icon: '💨', name: 'Воздушные фильтры', link: '/catalog?category=air-filters' },
        { icon: '⛽', name: 'Топливные фильтры', link: '/catalog?category=fuel-filters' },
        { icon: '⚙️', name: 'Поршни и кольца', link: '/catalog?category=pistons' },
        { icon: '🛞', name: 'Колеса и шины', link: '/catalog?category=wheels' }
    ];

    const advantages = [
        {
            icon: '⭐',
            title: 'Качество',
            description: 'Только оригинальные запчасти и проверенные бренды'
        },
        {
            icon: '🚚',
            title: 'Доставка',
            description: 'Быстрая доставка по всей России'
        },
        {
            icon: '💰',
            title: 'Цены',
            description: 'Конкурентные цены и регулярные акции'
        },
        {
            icon: '🔧',
            title: 'Консультации',
            description: 'Профессиональная помощь в подборе'
        }
    ];

    const news = [
        {
            id: 1,
            title: "Новые технологии в производстве поршней",
            date: "15 марта 2024",
            excerpt: "Современные методы литья позволяют создавать поршни, которые служат на 30% дольше."
        },
        {
            id: 2,
            title: "Как выбрать масляный фильтр",
            date: "12 марта 2024",
            excerpt: "Разбираемся в типах фильтров и сроках замены."
        },
        {
            id: 3,
            title: "Открытие нового склада в Москве",
            date: "10 марта 2024",
            excerpt: "Теперь доставка запчастей станет еще быстрее."
        }
    ];

    const testimonials = [
        {
            name: "Алексей Петров",
            text: "Отличный магазин! Быстро подобрали нужные запчасти, доставили вовремя. Буду заказывать еще.",
            rating: 5
        },
        {
            name: "Дмитрий Соколов",
            text: "Большой выбор фильтров, приятные цены. Спасибо за консультацию по подбору масляного фильтра.",
            rating: 5
        },
        {
            name: "Екатерина Иванова",
            text: "Заказывала салонный фильтр. Прислали с курьером на следующий день. Качеством довольна.",
            rating: 5
        }
    ];

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Hero секция */}
            <Row className={styles.heroSection}>
                <Col lg={8} className="mx-auto text-center">
                    <h1 className={styles.heroTitle}>
                        Колесо и поршень
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Ваш надежный партнер в мире автозапчастей
                    </p>
                    <p className={styles.heroDescription}>
                        Более 10 000 наименований запчастей в наличии.
                        Работаем с 2015 года.
                    </p>
                    <div className={styles.heroButtons}>
                        <Link
                            to="/catalog"
                            className={styles.primaryButton}
                        >
                            Перейти в каталог
                        </Link>
                        <Link
                            to="/information"
                            className={styles.secondaryButton}
                        >
                            О компании
                        </Link>
                    </div>
                </Col>
            </Row>

            {/* Категории */}
            <Row className="mb-5">
                <Col>
                    <h2 className={styles.sectionTitle}>Популярные категории</h2>
                </Col>
            </Row>
            <Row xs={2} md={3} lg={6} className="g-3 mb-5">
                {categories.map((cat, index) => (
                    <Col key={index}>
                        <Link to={cat.link} className={styles.categoryLink}>
                            <div className={styles.categoryItem}>
                                <div className={styles.categoryIcon}>{cat.icon}</div>
                                <div className={styles.categoryName}>{cat.name}</div>
                            </div>
                        </Link>
                    </Col>
                ))}
            </Row>

            {/* Преимущества */}
            <Row className="mb-5">
                <Col>
                    <h2 className={styles.sectionTitle}>Почему выбирают нас</h2>
                </Col>
            </Row>
            <Row xs={1} md={2} lg={4} className="g-4 mb-5">
                {advantages.map((adv, index) => (
                    <Col key={index}>
                        <div className={styles.advantageCard}>
                            <div className={styles.advantageIcon}>{adv.icon}</div>
                            <h3 className={styles.advantageTitle}>{adv.title}</h3>
                            <p className={styles.advantageDescription}>{adv.description}</p>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Новости */}
            <Row className="mb-4">
                <Col>
                    <h2 className={styles.sectionTitle}>Новости и статьи</h2>
                </Col>
            </Row>
            <Row xs={1} md={3} className="g-4 mb-5">
                {news.map((item) => (
                    <Col key={item.id}>
                        <Card className={styles.newsCard}>
                            <Card.Body>
                                <div className={styles.newsDate}>{item.date}</div>
                                <Card.Title className={styles.newsTitle}>
                                    {item.title}
                                </Card.Title>
                                <Card.Text className={styles.newsText}>
                                    {item.excerpt}
                                </Card.Text>
                                <Link to={`/news?id=${item.id}`} className={styles.newsLink}>
                                    Читать далее →
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Отзывы */}
            <Row className="mb-4">
                <Col>
                    <h2 className={styles.sectionTitle}>Отзывы клиентов</h2>
                </Col>
            </Row>
            <Row xs={1} md={3} className="g-4 mb-5">
                {testimonials.map((item, index) => (
                    <Col key={index}>
                        <div className={styles.testimonialCard}>
                            <div className={styles.testimonialRating}>
                                {[...Array(item.rating)].map((_, i) => (
                                    <span key={i} className={styles.star}>★</span>
                                ))}
                            </div>
                            <p className={styles.testimonialText}>"{item.text}"</p>
                            <div className={styles.testimonialAuthor}>— {item.name}</div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* CTA секция */}
            <Row className="mb-4">
                <Col>
                    <div className={styles.ctaSection}>
                        <h2 className={styles.ctaTitle}>Нужна помощь с выбором?</h2>
                        <p className={styles.ctaText}>
                            Наши специалисты всегда готовы помочь вам подобрать
                            необходимые запчасти и ответить на все вопросы.
                        </p>
                        <Link
                            to="/help"
                            className={styles.ctaButton}
                        >
                            Связаться с нами
                        </Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export { MainPage };