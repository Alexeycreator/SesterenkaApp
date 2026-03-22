/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Button, InputGroup, Form, Nav } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import styles from './NewsPage.module.css';

// Интерфейс для статьи
interface NewsItem {
    id: number;
    title: string;
    category: string;
    categoryName: string;
    excerpt: string;
    content?: string;
    date: string;
    author: string;
    readTime: string;
    views: string;
    comments: number;
    featured?: boolean;
    image?: string;
}

const NewsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');

    // Чтение параметров из URL
    const selectedCategory = searchParams.get('category') || 'all';
    const selectedNewsId = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;

    const news: NewsItem[] = [
        {
            id: 1,
            title: "Новые технологии в производстве поршней",
            category: 'technology',
            categoryName: "Технологии",
            excerpt: "Современные методы литья и новые сплавы позволяют создавать поршни, которые служат на 30% дольше.",
            content: "Полное содержание статьи о новых технологиях в производстве поршней...",
            date: "15 марта 2024",
            author: "Алексей Петров",
            readTime: "5 мин",
            views: "1.2k",
            comments: 23,
            featured: true
        },
        {
            id: 2,
            title: "Масляные фильтры: как выбрать и когда менять",
            category: 'advice',
            categoryName: "Советы",
            excerpt: "Разбираемся в типах масляных фильтров, их особенностях и сроках замены.",
            content: "Полное содержание статьи о масляных фильтрах...",
            date: "12 марта 2024",
            author: "Екатерина Смирнова",
            readTime: "4 мин",
            views: "876",
            comments: 15
        },
        {
            id: 3,
            title: "Открытие нового склада запчастей в Москве",
            category: 'company',
            categoryName: "Новости компании",
            excerpt: "Новый складской комплекс площадью 5000 кв.м позволит доставлять запчасти быстрее.",
            content: "Полное содержание новости об открытии склада...",
            date: "10 марта 2024",
            author: "Иван Сидоров",
            readTime: "3 мин",
            views: "654",
            comments: 8
        },
        {
            id: 4,
            title: "Обзор зимних шин 2024: тест драйв 10 моделей",
            category: 'reviews',
            categoryName: "Обзоры",
            excerpt: "Тест-драйв 10 моделей зимних шин в различных условиях. Рейтинг и рекомендации по выбору.",
            content: "Полный обзор зимних шин 2024...",
            date: "8 марта 2024",
            author: "Дмитрий Волков",
            readTime: "8 мин",
            views: "2.1k",
            comments: 45,
            featured: true
        },
        {
            id: 5,
            title: "Турбокомпрессоры: устройство, неисправности и ремонт",
            category: 'technology',
            categoryName: "Технологии",
            excerpt: "Подробный разбор устройства турбокомпрессоров, типичные поломки и способы их устранения.",
            content: "Полное руководство по турбокомпрессорам...",
            date: "5 марта 2024",
            author: "Алексей Петров",
            readTime: "6 мин",
            views: "1.5k",
            comments: 31
        },
        {
            id: 6,
            title: "Салонные фильтры: почему важно менять их вовремя",
            category: 'advice',
            categoryName: "Советы",
            excerpt: "Грязный салонный фильтр может стать причиной аллергии и заболеваний дыхательных путей.",
            content: "Подробная статья о важности замены салонных фильтров...",
            date: "3 марта 2024",
            author: "Екатерина Смирнова",
            readTime: "4 мин",
            views: "723",
            comments: 12
        }
    ];

    // Обновление URL при изменении категории или выборе статьи
    const updateUrl = (category: string, newsId?: number | null) => {
        const params: Record<string, string> = {};

        if (category !== 'all') {
            params.category = category;
        }

        if (newsId) {
            params.id = newsId.toString();
        }

        setSearchParams(params);
    };

    // Обработчик выбора категории
    const handleCategoryChange = (categoryId: string) => {
        updateUrl(categoryId);
    };

    // Обработчик выбора статьи
    const handleNewsSelect = (newsItem: NewsItem) => {
        updateUrl(newsItem.category, newsItem.id);
    };

    // Обработчик закрытия статьи
    const handleCloseArticle = () => {
        updateUrl(selectedCategory);
    };

    // Подсчет количества новостей в каждой категории
    const categories = useMemo(() => {
        const counts = {
            all: news.length,
            technology: news.filter(item => item.category === 'technology').length,
            advice: news.filter(item => item.category === 'advice').length,
            company: news.filter(item => item.category === 'company').length,
            reviews: news.filter(item => item.category === 'reviews').length
        };

        return [
            { id: 'all', name: 'Все новости', count: counts.all },
            { id: 'technology', name: 'Технологии', count: counts.technology },
            { id: 'advice', name: 'Советы', count: counts.advice },
            { id: 'company', name: 'Новости компании', count: counts.company },
            { id: 'reviews', name: 'Обзоры', count: counts.reviews }
        ];
    }, [news]);

    // Фильтрация новостей по категории
    const filteredNews = selectedCategory === 'all'
        ? news
        : news.filter(item => item.category === selectedCategory);

    // Поиск по заголовку и содержанию
    const searchedNews = filteredNews.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Находим выбранную статью
    const selectedNews = selectedNewsId
        ? news.find(item => item.id === selectedNewsId)
        : null;

    // Функция для сброса фильтров
    const resetFilters = () => {
        setSearchQuery('');
        updateUrl('all');
    };

    // Если выбрана конкретная статья, показываем её полное содержание
    if (selectedNews) {
        return (
            <Container fluid className={styles.pageContainer}>
                <Row className="mb-4">
                    <Col>
                        <Button
                            variant="link"
                            className={styles.backButton}
                            onClick={handleCloseArticle}
                        >
                            ← Назад к новостям
                        </Button>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <Card className={styles.fullArticleCard}>
                            <Card.Img
                                variant="top"
                                src={`https://via.placeholder.com/1200x400/8B5A2B/ffffff?text=${selectedNews.categoryName}`}
                                className={styles.fullArticleImage}
                            />
                            <Card.Body className={styles.fullArticleBody}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Badge className={styles.categoryBadge}>
                                        {selectedNews.categoryName}
                                    </Badge>
                                    <small className={styles.dateText}>
                                        📅 {selectedNews.date}
                                    </small>
                                </div>

                                <h1 className={styles.fullArticleTitle}>
                                    {selectedNews.title}
                                </h1>

                                <div className={styles.articleMeta}>
                                    <span className={styles.articleAuthor}>👤 {selectedNews.author}</span>
                                    <span className={styles.articleStats}>
                                        <span>⏱️ {selectedNews.readTime}</span>
                                        <span>👁️ {selectedNews.views}</span>
                                        <span>💬 {selectedNews.comments}</span>
                                    </span>
                                </div>

                                <div className={styles.articleContent}>
                                    <p className={styles.articleExcerpt}>{selectedNews.excerpt}</p>
                                    <p>{selectedNews.content}</p>
                                    <p>Дополнительный контент статьи... Здесь может быть подробное описание, изображения, видео и т.д.</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Иначе показываем список новостей
    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <h1 className={styles.title}>Новости и статьи</h1>
                    <p className={styles.subtitle}>
                        Будьте в курсе последних новостей автомобильного мира и полезных советов
                    </p>
                </Col>
            </Row>

            {/* Поиск и фильтры */}
            <Row className="mb-4">
                <Col md={6}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Поиск новостей..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <Button
                                variant="outline-secondary"
                                onClick={() => setSearchQuery('')}
                                className={styles.clearButton}
                            >
                                ✕
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            className={styles.searchButton}
                        >
                            🔍 Поиск
                        </Button>
                    </InputGroup>
                </Col>
                <Col md={6}>
                    <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                        {categories.map(cat => (
                            <Button
                                key={cat.id}
                                variant={selectedCategory === cat.id ? "primary" : "outline-secondary"}
                                size="sm"
                                onClick={() => handleCategoryChange(cat.id)}
                                className={selectedCategory === cat.id ? styles.activeFilter : styles.filterButton}
                            >
                                {cat.name} <span className={styles.categoryCount}>({cat.count})</span>
                            </Button>
                        ))}
                    </div>
                </Col>
            </Row>

            {/* Результаты поиска */}
            <Row className="mb-3">
                <Col>
                    <p className={styles.resultsInfo}>
                        Найдено новостей: <strong>{searchedNews.length}</strong>
                        {selectedCategory !== 'all' && (
                            <> в категории <strong>{categories.find(c => c.id === selectedCategory)?.name}</strong></>
                        )}
                        {searchQuery && (
                            <> по запросу "<strong>{searchQuery}</strong>"</>
                        )}
                    </p>
                </Col>
            </Row>

            {/* Сетка новостей */}
            <Row xs={1} md={2} lg={3} className="g-4">
                {searchedNews.map((item) => (
                    <Col key={item.id}>
                        <Card className={`h-100 ${styles.newsCard}`}>
                            <div className={styles.imageWrapper}>
                                <Card.Img
                                    variant="top"
                                    src={`https://via.placeholder.com/300x200/8B5A2B/ffffff?text=${item.categoryName}`}
                                    className={styles.cardImage}
                                />
                                {item.featured && (
                                    <Badge className={styles.featuredBadge}>
                                        🔥 Популярное
                                    </Badge>
                                )}
                            </div>
                            <Card.Body className={styles.cardBody}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Badge className={styles.categoryBadge}>
                                        {item.categoryName}
                                    </Badge>
                                    <small className={styles.dateText}>
                                        📅 {item.date}
                                    </small>
                                </div>

                                <Card.Title className={styles.cardTitle}>
                                    {item.title}
                                </Card.Title>

                                <Card.Text className={styles.cardText}>
                                    {item.excerpt}
                                </Card.Text>

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className={styles.authorInfo}>
                                        <span className={styles.authorName}>👤 {item.author}</span>
                                    </div>
                                    <Button
                                        variant="link"
                                        className={styles.readMoreBtn}
                                        onClick={() => handleNewsSelect(item)}
                                    >
                                        Читать далее →
                                    </Button>
                                </div>
                            </Card.Body>

                            <Card.Footer className={styles.cardFooter}>
                                <div className={styles.stats}>
                                    <span className={styles.statItem}>⏱️ {item.readTime}</span>
                                    <span className={styles.statItem}>👁️ {item.views}</span>
                                    <span className={styles.statItem}>💬 {item.comments}</span>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Если новостей нет */}
            {searchedNews.length === 0 && (
                <Row className="mt-5">
                    <Col className="text-center">
                        <div className={styles.noResults}>
                            <h3>😕 Новостей не найдено</h3>
                            <p>Попробуйте изменить параметры поиска или выбрать другую категорию</p>
                            <Button
                                variant="primary"
                                onClick={resetFilters}
                                className={styles.resetButton}
                            >
                                Сбросить фильтры
                            </Button>
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export { NewsPage }