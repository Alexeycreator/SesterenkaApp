/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Button, InputGroup, Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import { getAllNews, News } from '../../servicesApi/NewsApi';
import LoadingSpinner from '../../LoadingSpinner';

import styles from './NewsPage.module.css';

const NewsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Чтение параметров из URL
    const selectedCategory = searchParams.get('category') || 'all';
    const selectedNewsId = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;

    // Загрузка новостей из API
    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllNews();
            console.log(data);
            setNews(data);
        } catch (err: any) {
            console.error('Ошибка загрузки новостей:', err);
            const errorMsg = err.serverMessage || err.message || 'Не удалось загрузить новости';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

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
    const handleNewsSelect = (newsItem: News) => {
        updateUrl(selectedCategory, newsItem.id);
    };

    // Обработчик закрытия статьи
    const handleCloseArticle = () => {
        updateUrl(selectedCategory);
    };

    // Получение уникальных типов новостей для вкладок
    const categories = useMemo(() => {
        const typeCounts: Record<string, number> = {};

        // Подсчитываем количество новостей по каждому типу
        news.forEach(item => {
            const type = item.type || 'Новости';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        // Формируем массив категорий
        const categoryList = [
            { id: 'all', name: 'Все новости', count: news.length }
        ];

        // Добавляем уникальные типы
        Object.entries(typeCounts).forEach(([type, count]) => {
            categoryList.push({
                id: type.toLowerCase().replace(/\s+/g, '_'),
                name: type,
                count: count
            });
        });

        return categoryList;
    }, [news]);

    // Фильтрация новостей по категории
    const filteredNews = useMemo(() => {
        if (selectedCategory === 'all') {
            return news;
        }

        // Находим имя категории по id
        const category = categories.find(c => c.id === selectedCategory);
        if (!category) return news;

        return news.filter(item => item.type === category.name);
    }, [news, selectedCategory, categories]);

    // Поиск по тематике
    const searchedNews = useMemo(() => {
        if (!searchQuery.trim()) return filteredNews;

        return filteredNews.filter(item =>
            item.theme?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.body?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [filteredNews, searchQuery]);

    // Находим выбранную статью
    const selectedNews = selectedNewsId
        ? news.find(item => item.id === selectedNewsId)
        : null;

    // Форматирование даты
    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Дата не указана';

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
    };

    // Функция для сброса фильтров
    const resetFilters = () => {
        setSearchQuery('');
        updateUrl('all');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <Container fluid className={styles.pageContainer}>
                <Row className="justify-content-center">
                    <Col md={8} className="text-center">
                        <div className={styles.errorContainer}>
                            <h2>😕 Ошибка загрузки</h2>
                            <p>{error}</p>
                            <Button onClick={() => fetchNews()} className={styles.retryButton}>
                                🔄 Попробовать снова
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Если выбрана конкретная статья, показываем её полное содержание
    if (selectedNews) {
        const category = categories.find(c => c.name === selectedNews.type);

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
                            {selectedNews.image && (
                                <Card.Img
                                    variant="top"
                                    src={selectedNews.image}
                                    className={styles.fullArticleImage}
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder.jpg';
                                    }}
                                />
                            )}
                            <Card.Body className={styles.fullArticleBody}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Badge className={styles.categoryBadge}>
                                        {selectedNews.type || 'Новости'}
                                    </Badge>
                                    <small className={styles.dateText}>
                                        📅 {formatDate(selectedNews.date)}
                                    </small>
                                </div>

                                <h1 className={styles.fullArticleTitle}>
                                    {selectedNews.theme}
                                </h1>

                                <div className={styles.articleContent}>
                                    <p className={styles.articleExcerpt}>{selectedNews.body}</p>
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
            {searchedNews.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {searchedNews.map((item) => (
                        <Col key={item.id}>
                            <Card className={`h-100 ${styles.newsCard}`}>
                                <div className={styles.imageWrapper}>
                                    <Card.Img
                                        variant="top"
                                        src={item.image || '/placeholder.jpg'}
                                        className={styles.cardImage}
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder.jpg';
                                        }}
                                    />
                                </div>
                                <Card.Body className={styles.cardBody}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <Badge className={styles.categoryBadge}>
                                            {item.type || 'Новости'}
                                        </Badge>
                                        <small className={styles.dateText}>
                                            📅 {formatDate(item.date)}
                                        </small>
                                    </div>

                                    <Card.Title className={styles.cardTitle}>
                                        {item.theme}
                                    </Card.Title>

                                    <Card.Text className={styles.cardText}>
                                        {item.body.length > 200
                                            ? `${item.body.substring(0, 200)}...`
                                            : item.body}
                                    </Card.Text>

                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <Button
                                            variant="link"
                                            className={styles.readMoreBtn}
                                            onClick={() => handleNewsSelect(item)}
                                        >
                                            Читать далее →
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
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