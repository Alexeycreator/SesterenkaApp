/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, InputGroup, Form, Modal, Accordion } from 'react-bootstrap';

import { Categories } from '../../servicesApi/CategoriesApi';
import { Product } from '../../servicesApi/ProductsApi';
import { Manufacturer } from '../../servicesApi/ManufacturersApi';
import { StockWarehousesQuantity } from '../../servicesApi/StocksApi';
import { addToOrderItem, Catalog, getCatalogData } from '../../servicesApi/CatalogApi';
import LoadingSpinner from '../../LoadingSpinner';

import styles from './CatalogPage.module.css';

interface FilterState {
    brands: string[];
    minPrice: number;
    maxPrice: number;
}

// const categories: Category[] = [
//     {
//         id: 'oil-filters',
//         name: 'Масляные фильтры',
//         icon: '🛢️',
//         count: 24,
//         description: 'Фильтры для масла различных производителей',
//         image: 'https://via.placeholder.com/400x200'
//     },
//     {
//         id: 'cabin-filters',
//         name: 'Салонные фильтры',
//         icon: '🌬️',
//         count: 18,
//         description: 'Фильтры салона для чистого воздуха',
//         image: 'https://via.placeholder.com/400x200'
//     },
//     {
//         id: 'air-filters',
//         name: 'Воздушные фильтры',
//         icon: '💨',
//         count: 15,
//         description: 'Фильтры для очистки воздуха двигателя',
//         image: 'https://via.placeholder.com/400x200'
//     },
//     {
//         id: 'fuel-filters',
//         name: 'Топливные фильтры',
//         icon: '⛽',
//         count: 12,
//         description: 'Фильтры для очистки топлива',
//         image: 'https://via.placeholder.com/400x200'
//     },
//     {
//         id: 'pistons',
//         name: 'Поршни и кольца',
//         icon: '⚙️',
//         count: 32,
//         description: 'Поршни, кольца и комплектующие',
//         image: 'https://via.placeholder.com/400x200'
//     },
//     {
//         id: 'wheels',
//         name: 'Колеса и шины',
//         icon: '🛞',
//         count: 45,
//         description: 'Шины, диски и колесные аксессуары',
//         image: 'https://via.placeholder.com/400x200'
//     },
//     {
//         id: 'batteries',
//         name: 'Аккумуляторы',
//         icon: '🔋',
//         count: 16,
//         description: 'Автомобильные аккумуляторы',
//         image: 'https://via.placeholder.com/400x200'
//     },
//     {
//         id: 'tools',
//         name: 'Инструменты',
//         icon: '🔧',
//         count: 38,
//         description: 'Инструменты для обслуживания',
//         image: 'https://via.placeholder.com/400x200'
//     }
// ];

// const products: Product[] = [
//     {
//         id: 1,
//         name: "Фильтр масляный MANN-FILTER W 610/3",
//         category: "Масляные фильтры",
//         categoryId: 'oil-filters',
//         price: 450,
//         rating: 4.8,
//         image: "https://via.placeholder.com/300x200",
//         inStock: true,
//         description: "Оригинальный масляный фильтр для легковых автомобилей",
//         brand: "MANN-FILTER",
//         articleNumber: "W 610/3",
//         specifications: {
//             "Высота": "79 мм",
//             "Наружный диаметр": "76 мм",
//             "Резьба": "3/4-16 UNF",
//             "Клапан": "Есть"
//         }
//     },
//     {
//         id: 2,
//         name: "Фильтр масляный Bosch 0451103316",
//         category: "Масляные фильтры",
//         categoryId: 'oil-filters',
//         price: 520,
//         oldPrice: 590,
//         rating: 4.7,
//         image: "https://via.placeholder.com/300x200",
//         inStock: true,
//         description: "Высококачественный масляный фильтр Bosch",
//         brand: "Bosch",
//         articleNumber: "0451103316",
//         specifications: {
//             "Высота": "75 мм",
//             "Наружный диаметр": "76 мм",
//             "Резьба": "3/4-16 UNF",
//             "Клапан": "Есть"
//         }
//     },
//     {
//         id: 3,
//         name: "Фильтр салонный угольный MANN-FILTER CUK 2939",
//         category: "Салонные фильтры",
//         categoryId: 'cabin-filters',
//         price: 890,
//         rating: 4.9,
//         image: "https://via.placeholder.com/300x200",
//         inStock: true,
//         description: "Угольный салонный фильтр для очистки воздуха",
//         brand: "MANN-FILTER",
//         articleNumber: "CUK 2939",
//         specifications: {
//             "Длина": "287 мм",
//             "Ширина": "215 мм",
//             "Высота": "30 мм",
//             "Тип": "Угольный"
//         }
//     },
//     {
//         id: 4,
//         name: "Фильтр салонный обычный MANN-FILTER CU 2939",
//         category: "Салонные фильтры",
//         categoryId: 'cabin-filters',
//         price: 590,
//         rating: 4.6,
//         image: "https://via.placeholder.com/300x200",
//         inStock: true,
//         description: "Стандартный салонный фильтр",
//         brand: "MANN-FILTER",
//         articleNumber: "CU 2939",
//         specifications: {
//             "Длина": "287 мм",
//             "Ширина": "215 мм",
//             "Высота": "30 мм",
//             "Тип": "Обычный"
//         }
//     },
//     {
//         id: 5,
//         name: "Фильтр воздушный MANN-FILTER C 25 108",
//         category: "Воздушные фильтры",
//         categoryId: 'air-filters',
//         price: 680,
//         rating: 4.8,
//         image: "https://via.placeholder.com/300x200",
//         inStock: true,
//         description: "Воздушный фильтр для двигателя",
//         brand: "MANN-FILTER",
//         articleNumber: "C 25 108",
//         specifications: {
//             "Длина": "273 мм",
//             "Ширина": "120 мм",
//             "Высота": "47 мм",
//             "Тип": "Панельный"
//         }
//     },
//     {
//         id: 6,
//         name: "Фильтр топливный MANN-FILTER WK 31/2",
//         category: "Топливные фильтры",
//         categoryId: 'fuel-filters',
//         price: 750,
//         oldPrice: 820,
//         rating: 4.7,
//         image: "https://via.placeholder.com/300x200",
//         inStock: true,
//         description: "Топливный фильтр тонкой очистки",
//         brand: "MANN-FILTER",
//         articleNumber: "WK 31/2",
//         specifications: {
//             "Высота": "135 мм",
//             "Диаметр": "55 мм",
//             "Резьба": "M12x1.5",
//             "Тип": "Врезной"
//         }
//     }
// ];

const CatalogPage = () => {
    const api = process.env.REACT_APP_API_URL_IMAGES || 'http://localhost:5027';
    const navigate = useNavigate();

    // состояние данных страницы
    const [catalogData, setCatalogData] = useState<Catalog | null>();
    const [loadingCatalogData, setLoadingCatalogData] = useState(true);
    const [errorCatalogData, setErrorCatalogData] = useState<string | null>(null);

    // состояние категорий
    const [categoriesData, setCategoriesData] = useState<Categories[]>([]);

    // состояние товаров
    const [productData, setProductData] = useState<Product[]>([]);

    // состояние брэндов товаров
    const [manufacturerData, setManufacturerData] = useState<Manufacturer[]>([]);

    // состояние остатков на складе
    const [stockWarehousesQuantityData, setStockWarehousesQuantityData] = useState<StockWarehousesQuantity[]>([]);

    // состояния фильтров и поиска
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        brands: [],
        minPrice: 0,
        maxPrice: 10000
    });

    // новые состояния для временных значений цены
    const [tempMinPrice, setTempMinPrice] = useState<number>(filters.minPrice);
    const [tempMaxPrice, setTempMaxPrice] = useState<number>(filters.maxPrice);

    // получение данных для страницы
    const fetchCatalogData = async () => {
        try {
            setLoadingCatalogData(true);
            const catalogData = await getCatalogData();
            setCatalogData(catalogData);
            if (catalogData != null) {
                fillingCatalogData(catalogData);
            }
            else {
                console.log('Данные для страницы каталога пустые!');
            }
        }
        catch (err: any) {
            console.error('Ошибка загрузки страницы категории товаров:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorCatalogData(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorCatalogData(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorCatalogData('Ошибка соединения с сервером');
            }
        }
        finally {
            setLoadingCatalogData(false);
        }
    };

    // извлечение данных из объекта
    const fillingCatalogData = (data: Catalog) => {
        const allCategories = data?.categories;
        const allProducts = data?.products;
        const allStocks = data?.stocks;
        const allManufacturers = data?.manufacturers;
        setCategoriesData(allCategories);
        setProductData(allProducts);
        setStockWarehousesQuantityData(allStocks);
        setManufacturerData(allManufacturers);
    };

    // хуки
    useEffect(() => {
        fetchCatalogData();
    }, []);

    useEffect(() => {
        setTempMinPrice(filters.minPrice);
        setTempMaxPrice(filters.maxPrice);
    }, [filters.minPrice, filters.maxPrice]);

    // Чтение параметров из URL
    const selectedCategory = searchParams.get('category')
        ? parseInt(searchParams.get('category')!)
        : null;
    const selectedProductId = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;

    // Обновление URL
    const updateUrl = (category: number | null, productId?: number | null, search?: string, newFilters?: FilterState) => {
        const params: Record<string, string> = {};

        if (category !== null && category !== undefined) {
            params.category = category.toString();
        }

        if (productId) {
            params.id = productId.toString();
        }

        if (search) {
            params.search = search;
        }

        const currentFilters = newFilters || filters;

        let filteredBrands = currentFilters.brands;
        if (category && availableBrands.length > 0) {
            filteredBrands = currentFilters.brands.filter(brand =>
                availableBrands.includes(brand)
            );
        }

        if (filteredBrands.length > 0) {
            params.brands = filteredBrands.join(',');
        }

        if (currentFilters.minPrice > 0) {
            params.minPrice = currentFilters.minPrice.toString();
        }
        if (currentFilters.maxPrice < 10000) {
            params.maxPrice = currentFilters.maxPrice.toString();
        }

        setSearchParams(params);
    };

    // подсчет количества товаров в каждой категории
    const calculateCountProduct = () => {
        if (categoriesData?.length > 0 && productData?.length > 0) {
            const result = categoriesData.map(category => {
                const matchingProducts = productData.filter(product => {
                    const match = product.categories_Id === category.id;
                    return match;
                });
                return {
                    categoryId: category.id,
                    categoryName: category.name,
                    count: matchingProducts.length
                };
            });
            return result;
        }
    };

    // дополнительная функция для подсчета товаров: выводит не целый массив, а подходящие по категории
    const getProductCountForCategory = (categoryName: string) => {
        const counts = calculateCountProduct();
        const category = counts?.find(item => item.categoryName === categoryName);
        return category ? `${category.count} товар(ов)` : '0 товаров';
    };

    // Обработчик применения фильтра цены
    const applyPriceFilter = () => {
        const newFilters = {
            ...filters,
            minPrice: tempMinPrice,
            maxPrice: tempMaxPrice
        };
        setFilters(newFilters);
        updateUrl(selectedCategory, null, searchQuery, newFilters);
    };

    // Обработчики изменения временных значений
    const handleTempMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
        setTempMinPrice(value);
    };

    const handleTempMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
        setTempMaxPrice(value);
    };

    // Обработчик выбора категории
    const handleCategoryChange = (categoryId: number | null) => {
        updateUrl(categoryId, null, searchQuery, { brands: [], minPrice: 0, maxPrice: 10000 });
    };

    // Обработчик выбора товара
    const handleProductSelect = (product: Product) => {
        updateUrl(selectedCategory, product.id, searchQuery, filters);
    };

    // Обработчик закрытия товара
    const handleCloseProduct = () => {
        updateUrl(selectedCategory, null, searchQuery, filters);
    };

    // Обработчик поиска
    const handleSearch = () => {
        updateUrl(selectedCategory, null, searchQuery, filters);
    };

    // Обработчик изменения фильтров
    const handleBrandChange = (brand: string) => {
        const newBrands = filters.brands.includes(brand)
            ? filters.brands.filter(b => b !== brand)
            : [...filters.brands, brand];

        const newFilters = {
            ...filters,
            brands: newBrands
        };

        setFilters(newFilters);
        updateUrl(selectedCategory, null, searchQuery, newFilters);
    };

    const handlePriceChange = (type: 'min' | 'max', value: number) => {
        const newFilters = { ...filters, [type === 'min' ? 'minPrice' : 'maxPrice']: value };
        setFilters(newFilters);
        updateUrl(selectedCategory, null, searchQuery, newFilters);
    };

    const resetFilters = () => {
        const newFilters = { brands: [], minPrice: 0, maxPrice: 10000 };
        setFilters(newFilters);
        setTempMinPrice(0);
        setTempMaxPrice(10000);
        updateUrl(selectedCategory, null, searchQuery, newFilters);
    };

    // Получение данных категории
    const selectedCategoryData = selectedCategory
        ? categoriesData.find(c => c.id === selectedCategory)
        : null;

    // Получение доступных брендов для выбранной категории
    const availableBrands = useMemo(() => {
        let filtered = productData;
        if (selectedCategory) {
            const foundCategory = categoriesData.find(c => c.id === selectedCategory);
            if (foundCategory) {
                filtered = filtered.filter(p => p.categories_Id === foundCategory.id);
            }
        }

        const manufacturerIds = filtered
            .map(p => p.manufacturers_Id)
            .filter((id): id is number => id !== null && id !== undefined);

        const brandNames = manufacturerIds
            .map(id => {
                const manufacturer = manufacturerData?.find(m => m.id === id);
                return manufacturer?.name;
            })
            .filter((name): name is string => name !== null && name !== undefined);

        return Array.from(new Set(brandNames));
    }, [selectedCategory, productData, manufacturerData, categoriesData]);

    // Получение диапазона цен для выбранной категории
    const priceRange = useMemo(() => {
        let filtered = productData;
        if (selectedCategory) {
            const foundCategory = categoriesData.find(c => c.id === selectedCategory);
            if (foundCategory) {
                filtered = filtered.filter(p => p.categories_Id === foundCategory.id);
            }
        }
        const prices = filtered.map(p => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }, [selectedCategory]);

    // Фильтрация товаров
    const normalizeString = (str: string) => {
        return str.toLowerCase().replace(/\s+/g, '');
    };

    const filteredProducts = useMemo(() => {
        let filtered = productData;

        // фильтр по категории
        if (selectedCategory) {
            const foundCategory = categoriesData.find(c => c.id === selectedCategory);
            if (foundCategory) {
                filtered = filtered.filter(p => p.categories_Id === foundCategory.id);
            }
        }

        // фильтр по поиску
        if (searchQuery) {
            const normalizedQuery = normalizeString(searchQuery);
            filtered = filtered.filter(p =>
                normalizeString(p.name).includes(normalizedQuery) ||
                normalizeString(p.partNumber).includes(normalizedQuery)
            );
        }

        // фильтр по брендам
        if (filters.brands.length > 0) {
            const selectedManufacturerIds = manufacturerData
                ?.filter(m => {
                    const isMatch = filters.brands.includes(m.name);
                    if (isMatch) {
                        console.log(`  Найден производитель: ${m.name} (ID: ${m.id})`);
                    }
                    return isMatch;
                })
                .map(m => m.id) ?? [];

            filtered = filtered.filter(p =>
                p.manufacturers_Id && selectedManufacturerIds.includes(p.manufacturers_Id)
            );
        }

        // фильтр по цене
        filtered = filtered.filter(p =>
            p.price >= filters.minPrice && p.price <= filters.maxPrice
        );

        return filtered;
    }, [selectedCategory, searchQuery, filters]);

    // Находим выбранный товар
    const selectedProduct = selectedProductId
        ? productData.find(item => item.id === selectedProductId)
        : null;

    // Для отображения всех товаров
    const getProductStock = (productId: number) => {
        const productData = stockWarehousesQuantityData.find(item => item.productId === productId);
        return productData;
    };

    // добавление позиций в корзину
    const addToOrderItems = async (productId: number, quantity: number = 1) => {
        try {
            setLoadingCatalogData(true);
            const result = await addToOrderItem(productId);
            console.log('Товар успешно добавлен в корзину: ', result);
            navigate('/basket');
        }
        catch (error: any) {
            console.error('Ошибка добавления:', error);

            // Показываем сообщение об ошибке от сервера
            if (error.serverMessage) {
                console.log(error.serverMessage);
            } else if (error.message) {
                console.log(error.message);
            } else {
                console.log('Не удалось добавить товар в корзину');
            }
        } finally {
            setLoadingCatalogData(false);
        }
    };

    // уловие для отображение загрузки страницы
    if (loadingCatalogData) {
        return <LoadingSpinner />;
    }

    // Если выбран конкретный товар, показываем его полное описание
    if (selectedProduct) {
        return (
            <Container fluid className={styles.pageContainer}>
                <Row className="mb-4">
                    <Col>
                        <Button
                            variant="link"
                            className={styles.backButton}
                            onClick={handleCloseProduct}
                        >
                            ← Назад к товарам
                        </Button>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <Card className={styles.fullProductCard}>
                            <Row className="g-0">
                                <Col md={6}>
                                    <Card.Img
                                        src={`${api}/${selectedProduct.image}`}
                                        className={styles.fullProductImage}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Card.Body className={styles.fullProductBody}>
                                        <div className={styles.fullProductHeader}>
                                            <Badge className={styles.categoryBadge}>
                                                {selectedCategoryData?.name}
                                            </Badge>
                                            {(() => {
                                                const productStock = getProductStock(selectedProduct.id);
                                                const quantity = productStock?.totalQuantity ?? 0;
                                                const isInStock = quantity > 0;
                                                return (
                                                    <Badge className={isInStock ? styles.inStockBadge : styles.outOfStockBadge}>
                                                        {isInStock ? `В наличии: ${quantity} шт.` : 'Нет в наличии'}
                                                    </Badge>
                                                );
                                            })()}
                                        </div>
                                        <h1 className={styles.fullProductTitle}>
                                            {selectedProduct.name}
                                        </h1>
                                        <div className={styles.fullProductBrand}>
                                            {manufacturerData?.find(m => m.id === selectedProduct?.manufacturers_Id)?.name || 'Бренд не указан'}
                                        </div>
                                        <div className={styles.fullProductArticle}>
                                            Артикул: {selectedProduct.partNumber}
                                        </div>
                                        <div className={styles.fullProductPrice}>
                                            {selectedProduct.price} ₽
                                        </div>
                                        <p className={styles.fullProductDescription}>
                                            {selectedProduct.details}
                                        </p>
                                        {/* Добавление в корзину */}
                                        <div className={styles.fullProductActions}>
                                            {(() => {
                                                const productStock = getProductStock(selectedProduct.id);
                                                const quantity = productStock?.totalQuantity ?? 0;
                                                const isInStock = quantity > 0;

                                                return (
                                                    <Button
                                                        className={styles.fullProductAddToCartButton}
                                                        disabled={!isInStock}
                                                        onClick={() => {
                                                            if (isInStock) {
                                                                // Логика добавления в корзину
                                                                addToOrderItems(selectedProduct.id);
                                                                //navigate('/basket');
                                                            }
                                                        }}
                                                    >
                                                        {isInStock ? `🛒 Добавить в корзину` : '❌ Нет в наличии'}
                                                    </Button>
                                                );
                                            })()}
                                        </div>
                                    </Card.Body>
                                </Col>
                            </Row>

                            Описание спецификаций (высота, ширина, посадочное место)
                            {/* {selectedProduct.specifications && (
                                <Row className="mt-4">
                                    <Col>
                                        <h5 className={styles.specsTitle}>Технические характеристики</h5>
                                        <div className={styles.specsGrid}>
                                            {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                                                <div key={key} className={styles.specItem}>
                                                    <span className={styles.specKey}>{key}:</span>
                                                    <span className={styles.specValue}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Col>
                                </Row>
                            )} */}
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Иначе показываем список категорий или товаров
    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <h1 className={styles.title}>Каталог товаров</h1>
                    <p className={styles.subtitle}>
                        Найдите необходимые запчасти по названию или артикулу
                    </p>
                </Col>
            </Row>

            {/* Категории или товары */}
            {!selectedCategory ? (
                // Отображаем категории (без поиска)
                <>
                    <h2 className={styles.sectionTitle}>Категории товаров</h2>
                    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                        {categoriesData.map((category) => (
                            <Col key={category.id}>
                                <Card
                                    className={`h-100 ${styles.categoryCard}`}
                                    onClick={() => handleCategoryChange(category.id)}
                                >
                                    <Card.Body className={styles.categoryCardBody}>
                                        <div className={styles.categoryIconLarge}>
                                            <span>{category.icon || '📦'}</span>
                                        </div>
                                        <Card.Title className={styles.categoryTitle}>
                                            {category.name}
                                        </Card.Title>
                                        <Card.Text className={styles.categoryDescription}>
                                            {category.description}
                                        </Card.Text>
                                        <div className={styles.categoryFooter}>
                                            <Badge className={styles.productCount}>
                                                {getProductCountForCategory(category.name)}
                                            </Badge>
                                            <span className={styles.categoryLink}>
                                                Просмотреть →
                                            </span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            ) : (
                // Отображаем товары категории (с поиском)
                selectedCategoryData && (
                    <>
                        <Row>
                            {/* Фильтры */}
                            <Col md={3} className="mb-4">
                                <Card className={styles.filtersCard}>
                                    <Card.Body>
                                        <h3 className={styles.filtersTitle}>Фильтры</h3>
                                        {/* Поиск внутри карточки фильтров */}
                                        <div className="mb-4">
                                            <InputGroup>
                                                <Form.Control
                                                    placeholder="Поиск по названию или артикулу..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                                                    onClick={handleSearch}
                                                    className={styles.searchButton}
                                                >
                                                    🔍
                                                </Button>
                                            </InputGroup>
                                        </div>
                                        <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
                                            <Accordion.Item eventKey="0">
                                                <Accordion.Header>Бренды</Accordion.Header>
                                                <Accordion.Body>
                                                    {availableBrands.map((brand) => {
                                                        const brandString = brand?.toString() ?? '';
                                                        if (!brandString) {
                                                            return null;
                                                        }
                                                        return (
                                                            <Form.Check
                                                                key={brandString}
                                                                type="checkbox"
                                                                id={`brand-${brandString}`}
                                                                label={brandString}
                                                                checked={filters.brands.includes(brandString)}
                                                                onChange={() => handleBrandChange(brandString)}
                                                                className={styles.filterCheckbox}
                                                            />
                                                        );
                                                    })}
                                                </Accordion.Body>
                                            </Accordion.Item>

                                            <Accordion.Item eventKey="1">
                                                <Accordion.Header>Цена</Accordion.Header>
                                                <Accordion.Body>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>От</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={tempMinPrice === 0 ? '' : tempMinPrice}
                                                            onChange={handleTempMinPriceChange}
                                                            placeholder="0"
                                                            min={priceRange.min}
                                                            max={priceRange.max}
                                                            className={styles.priceInput}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>До</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={tempMaxPrice === 10000 ? '' : tempMaxPrice}
                                                            onChange={handleTempMaxPriceChange}
                                                            placeholder="10000"
                                                            min={priceRange.min}
                                                            max={priceRange.max}
                                                            className={styles.priceInput}
                                                        />
                                                    </Form.Group>
                                                    <Button
                                                        variant="primary"
                                                        onClick={applyPriceFilter}
                                                        className={styles.applyPriceButton}
                                                        size="sm"
                                                    >
                                                        Применить
                                                    </Button>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>

                                        <Button
                                            variant="outline-secondary"
                                            onClick={resetFilters}
                                            className={styles.resetFiltersButton}
                                            size="sm"
                                        >
                                            Сбросить фильтры
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Товары */}
                            <Col md={9}>
                                <Row className="mb-4">
                                    <Col>
                                        <h2 className={styles.categoryHeaderTitle}>
                                            {selectedCategoryData.name}{/* {selectedCategoryData.icon} {selectedCategoryData.name} */}
                                        </h2>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col>
                                        <p className={styles.resultsInfo}>
                                            Найдено товаров: <strong>{filteredProducts.length}</strong>
                                            {searchQuery && (
                                                <> по запросу "<strong>{searchQuery}</strong>"</>
                                            )}
                                        </p>
                                    </Col>
                                </Row>

                                {filteredProducts.length > 0 ? (
                                    <Row xs={1} md={2} lg={3} className="g-4">
                                        {filteredProducts.map((product) => (
                                            <Col key={product.id}>
                                                <Card
                                                    className={`h-100 ${styles.productCard}`}
                                                    onClick={() => handleProductSelect(product)}
                                                >
                                                    <div className={styles.productImageWrapper}>
                                                        <Card.Img
                                                            variant="top"
                                                            src={`${api}/${product.image}`}
                                                            className={styles.productImage}
                                                        />
                                                        {(() => {
                                                            const productStock = getProductStock(product.id);
                                                            const isInStock = (productStock?.totalQuantity ?? 0) > 0;

                                                            if (!isInStock) {
                                                                return (
                                                                    <Badge className={styles.outOfStockBadge}>
                                                                        Нет в наличии
                                                                    </Badge>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                    <Card.Body className={styles.productCardBody}>
                                                        <div className={styles.productBrand}>
                                                            {manufacturerData?.find(m => m.id === product?.manufacturers_Id)?.name || 'Бренд не указан'}
                                                        </div>
                                                        <Card.Title className={styles.productCardTitle}>
                                                            {product.name}
                                                        </Card.Title>
                                                        <div className={styles.productArticle}>
                                                            Арт: {product.partNumber}
                                                        </div>
                                                        <div className={styles.productPrice}>
                                                            {product.price} ₽
                                                        </div>
                                                        <Button
                                                            className={styles.viewProductButton}
                                                            variant="primary"
                                                            size="sm"
                                                        >
                                                            Подробнее
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                        <div>
                                            <Row className="mb-4">
                                                <Col>
                                                    <Button
                                                        variant="link"
                                                        className={styles.backButton}
                                                        onClick={() => handleCategoryChange(null)}
                                                    >
                                                        ← Назад к категориям
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Row>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <h3>😕 Товары не найдены</h3>
                                        <p>Попробуйте изменить параметры фильтрации</p>
                                        <Button
                                            variant="primary"
                                            onClick={resetFilters}
                                            className={styles.resetButton}
                                        >
                                            Сбросить фильтры
                                        </Button>
                                        <Button
                                            variant="link"
                                            className={styles.resetButton}
                                            onClick={() => handleCategoryChange(null)}
                                        >
                                            ← Назад к категориям
                                        </Button>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </>
                )
            )}
        </Container>
    );
}

export { CatalogPage };