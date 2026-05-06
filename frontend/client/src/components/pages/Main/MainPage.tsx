import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { getCategories, Categories } from '../../servicesApi/CategoriesApi';

import styles from './MainPage.module.css';

// Кэш для категорий (за пределами компонента)
let cachedCategories: any[] | null = null;
let isLoading = false;
let isInitialized = false;

const MainPage = () => {
    // Состояние для категорий
    const [randomCategories, setRandomCategories] = useState<any[]>(cachedCategories || []);
    const [loading, setLoading] = useState(!cachedCategories);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    const defaultCategories = [
        { id: 1, icon: '🛢️', name: 'Масляные фильтры', link: '/catalog?category=1' },
        { id: 2, icon: '🌬️', name: 'Салонные фильтры', link: '/catalog?category=2' },
        { id: 3, icon: '💨', name: 'Воздушные фильтры', link: '/catalog?category=3' },
        { id: 4, icon: '⛽', name: 'Топливные фильтры', link: '/catalog?category=4' },
        { id: 5, icon: '⚙️', name: 'Поршни и кольца', link: '/catalog?category=5' },
        { id: 6, icon: '🛞', name: 'Колеса и шины', link: '/catalog?category=6' }
    ];

    // Функция для выбора 6 случайных категорий
    const selectRandomCategories = (categories: any[]) => {
        if (!categories || categories.length === 0) return;

        const shuffled = [...categories];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const selected = shuffled.slice(0, 6);
        if (isMounted.current) {
            setRandomCategories(selected);
        }
        return selected;
    };

    // Функция для получения категорий из API (только один раз)
    const fetchCategories = async (forceRefresh: boolean = false) => {
        // Если уже загружены и не принудительное обновление, используем кэш
        if (cachedCategories !== null && !forceRefresh) {
            if (isMounted.current) {
                selectRandomCategories(cachedCategories);
                setLoading(false);
            }
            return;
        }

        // Если уже идет загрузка, ждем
        if (isLoading) return;

        isLoading = true;
        if (isMounted.current) {
            setLoading(true);
            setError(null);
        }

        try {
            const categories = await getCategories();

            let apiCategories;
            if (categories && categories.length > 0) {
                apiCategories = categories.map((cat: Categories) => ({
                    id: cat.id,
                    icon: cat.icon || '📦',
                    name: cat.name,
                    link: `/catalog?category=${cat.id}`
                }));
            } else {
                apiCategories = defaultCategories;
            }

            // Сохраняем в кэш
            cachedCategories = apiCategories;

            if (isMounted.current) {
                selectRandomCategories(apiCategories);
                setError(null);
            }
        } catch (error: any) {
            console.error('Ошибка загрузки категорий:', error);
            if (isMounted.current) {
                const errorMsg = error.serverMessage || error.message || 'Не удалось загрузить категории';
                setError(errorMsg);
                selectRandomCategories(defaultCategories);
            }
        } finally {
            isLoading = false;
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    // Функция для обновления случайных категорий (перетасовка без перезагрузки)
    const refreshCategories = () => {
        if (cachedCategories && cachedCategories.length > 0) {
            selectRandomCategories(cachedCategories);
        } else if (randomCategories.length > 0) {
            selectRandomCategories(randomCategories);
        } else {
            selectRandomCategories(defaultCategories);
        }
    };

    // Принудительное обновление из кэша (после изменения категорий в админке)
    const forceRefreshCategories = () => {
        cachedCategories = null;
        fetchCategories(true);
    };

    // Загрузка категорий при монтировании компонента
    useEffect(() => {
        isMounted.current = true;

        // Загружаем данные только если они еще не загружены
        if (!isInitialized) {
            isInitialized = true;
            fetchCategories();
        } else if (cachedCategories) {
            selectRandomCategories(cachedCategories);
            setLoading(false);
        }

        // Слушаем событие обновления категорий (из админки)
        const handleCategoriesUpdate = () => {
            forceRefreshCategories();
        };

        window.addEventListener('categoriesUpdated', handleCategoriesUpdate);

        return () => {
            isMounted.current = false;
            window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
        };
    }, []);

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
                        <Link to="/catalog" className={styles.primaryButton}>
                            Перейти в каталог
                        </Link>
                        <Link to="/information" className={styles.secondaryButton}>
                            О компании
                        </Link>
                    </div>
                </Col>
            </Row>

            {/* Категории */}
            <Row className="mb-4">
                <Col>
                    <h2 className={styles.sectionTitle}>Популярные категории</h2>
                    <p className={styles.sectionSubtitle}>
                        Каждый раз новые предложения для вас
                    </p>
                </Col>
            </Row>

            {/* Отображение ошибки */}
            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger" className={styles.errorAlert} onClose={() => setError(null)} dismissible>
                            <Alert.Heading>❌ Ошибка загрузки!</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    </Col>
                </Row>
            )}

            {loading ? (
                <Row className="mb-5">
                    <Col className="text-center">
                        <div className={styles.loader}>Загрузка категорий...</div>
                    </Col>
                </Row>
            ) : (
                <>
                    <Row xs={2} md={3} lg={6} className="g-3 mb-4">
                        {randomCategories.map((cat) => (
                            <Col key={cat.id}>
                                <Link to={cat.link} className={styles.categoryLink}>
                                    <div className={styles.categoryItem}>
                                        <div className={styles.categoryIcon}>
                                            {cat.icon}
                                        </div>
                                        <div className={styles.categoryName}>{cat.name}</div>
                                    </div>
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    {/* Кнопка обновления категорий */}
                    <Row className="mb-5">
                        <Col className="text-center">
                            <button
                                onClick={refreshCategories}
                                className={styles.refreshButton}
                            >
                                🔄 Обновить подборку
                            </button>
                        </Col>
                    </Row>
                </>
            )}

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

            {/* CTA секция */}
            <Row className="mb-4">
                <Col>
                    <div className={styles.ctaSection}>
                        <h2 className={styles.ctaTitle}>Нужна помощь с выбором?</h2>
                        <p className={styles.ctaText}>
                            Наши специалисты всегда готовы помочь вам подобрать
                            необходимые запчасти и ответить на все вопросы.
                        </p>
                        <Link to="/help" className={styles.ctaButton}>
                            Связаться с нами
                        </Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export { MainPage };