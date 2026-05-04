import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import { Categories } from '../../servicesApi/CategoriesApi';
import { Product } from '../../servicesApi/ProductsApi';
import { Manufacturer } from '../../servicesApi/ManufacturersApi';
import { StockWarehousesQuantity } from '../../servicesApi/StocksApi';
import { addToOrderItem, Catalog, getCatalogData } from '../../servicesApi/CatalogApi';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import LoadingSpinner from '../../LoadingSpinner';
import { CategoriesList } from './components/CategoriesList';
import { ProductsList } from './components/ProductsList';
import { Filters } from './components/Filters';
import { ProductDetails } from './components/ProductDetails';

import styles from './CatalogPage.module.css';

interface FilterState {
    brands: string[];
    minPrice: number;
    maxPrice: number;
}

// Функция нормализации строки
const normalizeString = (str: string) => str.toLowerCase().replace(/\s+/g, '');

const CatalogPage = () => {
    const api = process.env.REACT_APP_API_URL_IMAGES || 'http://localhost:5027';
    const { user: currentUser, isAuthenticated } = useAuth();

    // Состояния
    const [catalogData, setCatalogData] = useState<Catalog | null>();
    const [loadingCatalogData, setLoadingCatalogData] = useState(true);
    const [categoriesData, setCategoriesData] = useState<Categories[]>([]);
    const [productData, setProductData] = useState<Product[]>([]);
    const [manufacturerData, setManufacturerData] = useState<Manufacturer[]>([]);
    const [stockWarehousesQuantityData, setStockWarehousesQuantityData] = useState<StockWarehousesQuantity[]>([]);

    // Фильтры и поиск
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        brands: [],
        minPrice: 0,
        maxPrice: 10000
    });
    const [tempMinPrice, setTempMinPrice] = useState<number>(filters.minPrice);
    const [tempMaxPrice, setTempMaxPrice] = useState<number>(filters.maxPrice);

    // Модальное окно авторизации
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingProductId, setPendingProductId] = useState<number | null>(null);

    // Чтение параметров из URL
    const selectedCategory = searchParams.get('category')
        ? parseInt(searchParams.get('category')!)
        : null;
    const selectedProductId = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;

    // Загрузка данных
    useEffect(() => {
        fetchCatalogData();
    }, []);

    useEffect(() => {
        setTempMinPrice(filters.minPrice);
        setTempMaxPrice(filters.maxPrice);
    }, [filters.minPrice, filters.maxPrice]);

    // Чтение поискового запроса из URL при загрузке
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchQuery(searchFromUrl);
        }
        const categorySearchFromUrl = searchParams.get('categorySearch');
        if (categorySearchFromUrl) {
            setCategorySearchQuery(categorySearchFromUrl);
        }
    }, []);

    const fetchCatalogData = async () => {
        try {
            setLoadingCatalogData(true);
            const data = await getCatalogData();
            setCatalogData(data);
            if (data) {
                setCategoriesData(data.categories);
                setProductData(data.products);
                setStockWarehousesQuantityData(data.stocks);
                setManufacturerData(data.manufacturers);
            }
        } catch (err) {
            console.error('Ошибка загрузки:', err);
        } finally {
            setLoadingCatalogData(false);
        }
    };

    // Обновление URL (только для важных параметров, не для каждого символа поиска)
    const updateUrl = (category: number | null, productId?: number | null, newFilters?: FilterState) => {
        const params: Record<string, string> = {};
        if (category !== null && category !== undefined) {
            params.category = category.toString();
        }
        if (productId) {
            params.id = productId.toString();
        }

        if (searchQuery && searchQuery.trim()) {
            params.search = searchQuery;
        }
        if (categorySearchQuery && categorySearchQuery.trim()) {
            params.categorySearch = categorySearchQuery;
        }

        const currentFilters = newFilters || filters;
        let filteredBrands = currentFilters.brands;
        if (category && availableBrands.length > 0) {
            filteredBrands = currentFilters.brands.filter(brand => availableBrands.includes(brand));
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

        setSearchParams(params, { replace: true });
    };

    // Мгновенный поиск по категориям (префиксный поиск - только по началу названия)
    const handleCategorySearchChange = (value: string) => {
        setCategorySearchQuery(value);

        if (window.categorySearchTimeout) {
            clearTimeout(window.categorySearchTimeout);
        }
        window.categorySearchTimeout = setTimeout(() => {
            const params: Record<string, string> = {};
            if (selectedCategory) {
                params.category = selectedCategory.toString();
            }
            if (searchQuery && searchQuery.trim()) {
                params.search = searchQuery;
            }
            if (value && value.trim()) {
                params.categorySearch = value;
            }
            if (filters.brands.length > 0) {
                params.brands = filters.brands.join(',');
            }
            if (filters.minPrice > 0) {
                params.minPrice = filters.minPrice.toString();
            }
            if (filters.maxPrice < 10000) {
                params.maxPrice = filters.maxPrice.toString();
            }
            setSearchParams(params, { replace: true });
        }, 500);
    };

    // Мгновенный поиск по товарам
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (window.productSearchTimeout) {
            clearTimeout(window.productSearchTimeout);
        }
        window.productSearchTimeout = setTimeout(() => {
            const params: Record<string, string> = {};
            if (selectedCategory) {
                params.category = selectedCategory.toString();
            }
            if (value && value.trim()) {
                params.search = value;
            }
            if (categorySearchQuery && categorySearchQuery.trim()) {
                params.categorySearch = categorySearchQuery;
            }
            if (filters.brands.length > 0) {
                params.brands = filters.brands.join(',');
            }
            if (filters.minPrice > 0) {
                params.minPrice = filters.minPrice.toString();
            }
            if (filters.maxPrice < 10000) {
                params.maxPrice = filters.maxPrice.toString();
            }
            setSearchParams(params, { replace: true });
        }, 500);
    };

    // Фильтрация категорий по поисковому запросу (ПРЕФИКСНЫЙ поиск - только по началу слова)
    const filteredCategories = useMemo(() => {
        if (!categorySearchQuery.trim()) {
            return categoriesData;
        }
        const normalizedQuery = normalizeString(categorySearchQuery);
        // Ищем только те категории, которые начинаются с поискового запроса
        return categoriesData.filter(category => {
            const normalizedName = normalizeString(category.name);
            return normalizedName.startsWith(normalizedQuery);
        });
    }, [categoriesData, categorySearchQuery]);

    // Вычисляемые значения
    const selectedCategoryData = selectedCategory
        ? categoriesData.find(c => c.id === selectedCategory)
        : null;

    const availableBrands = useMemo(() => {
        let filtered = productData;
        if (selectedCategory) {
            const foundCategory = categoriesData.find(c => c.id === selectedCategory);
            if (foundCategory) {
                filtered = filtered.filter(p => p.categories_Id === foundCategory.id);
            }
        }
        const manufacturerIds = filtered.map(p => p.manufacturers_Id).filter((id): id is number => id !== null && id !== undefined);
        const brandNames = manufacturerIds.map(id => manufacturerData?.find(m => m.id === id)?.name).filter((name): name is string => name !== null && name !== undefined);
        return Array.from(new Set(brandNames));
    }, [selectedCategory, productData, manufacturerData, categoriesData]);

    const priceRange = useMemo(() => {
        let filtered = productData;
        if (selectedCategory) {
            const foundCategory = categoriesData.find(c => c.id === selectedCategory);
            if (foundCategory) {
                filtered = filtered.filter(p => p.categories_Id === foundCategory.id);
            }
        }
        const prices = filtered.map(p => p.price);
        if (prices.length === 0) {
            return { min: 0, max: 10000 };
        }
        return { min: Math.min(...prices), max: Math.max(...prices) };
    }, [selectedCategory, productData, categoriesData]);

    // Фильтрация товаров
    const filteredProducts = useMemo(() => {
        let filtered = productData;
        if (selectedCategory) {
            const foundCategory = categoriesData.find(c => c.id === selectedCategory);
            if (foundCategory) {
                filtered = filtered.filter(p => p.categories_Id === foundCategory.id);
            }
        }
        if (searchQuery) {
            const normalizedQuery = normalizeString(searchQuery);
            filtered = filtered.filter(p =>
                normalizeString(p.name).includes(normalizedQuery) ||
                normalizeString(p.partNumber).includes(normalizedQuery)
            );
        }
        if (filters.brands.length > 0) {
            const selectedManufacturerIds = manufacturerData?.filter(m => filters.brands.includes(m.name)).map(m => m.id) ?? [];
            filtered = filtered.filter(p => p.manufacturers_Id && selectedManufacturerIds.includes(p.manufacturers_Id));
        }
        filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
        return filtered;
    }, [selectedCategory, searchQuery, filters, productData, categoriesData, manufacturerData]);

    const selectedProduct = selectedProductId ? productData.find(item => item.id === selectedProductId) : null;
    const getProductStock = (productId: number) => stockWarehousesQuantityData.find(item => item.productId === productId);

    // Обработчики
    const handleCategoryChange = (categoryId: number | null) => {
        setSearchQuery('');
        setCategorySearchQuery('');
        setFilters({ brands: [], minPrice: 0, maxPrice: 10000 });
        setTempMinPrice(0);
        setTempMaxPrice(10000);
        updateUrl(categoryId, null, { brands: [], minPrice: 0, maxPrice: 10000 });
    };

    const handleProductSelect = (product: Product) => {
        updateUrl(selectedCategory, product.id);
    };

    const handleCloseProduct = () => {
        updateUrl(selectedCategory, null);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        const params: Record<string, string> = {};
        if (selectedCategory) {
            params.category = selectedCategory.toString();
        }
        if (categorySearchQuery && categorySearchQuery.trim()) {
            params.categorySearch = categorySearchQuery;
        }
        if (filters.brands.length > 0) {
            params.brands = filters.brands.join(',');
        }
        if (filters.minPrice > 0) {
            params.minPrice = filters.minPrice.toString();
        }
        if (filters.maxPrice < 10000) {
            params.maxPrice = filters.maxPrice.toString();
        }
        setSearchParams(params, { replace: true });
    };

    const handleClearCategorySearch = () => {
        setCategorySearchQuery('');
        const params: Record<string, string> = {};
        if (selectedCategory) {
            params.category = selectedCategory.toString();
        }
        if (searchQuery && searchQuery.trim()) {
            params.search = searchQuery;
        }
        if (filters.brands.length > 0) {
            params.brands = filters.brands.join(',');
        }
        if (filters.minPrice > 0) {
            params.minPrice = filters.minPrice.toString();
        }
        if (filters.maxPrice < 10000) {
            params.maxPrice = filters.maxPrice.toString();
        }
        setSearchParams(params, { replace: true });
    };

    const handleBrandChange = (brand: string) => {
        const newBrands = filters.brands.includes(brand)
            ? filters.brands.filter(b => b !== brand)
            : [...filters.brands, brand];
        const newFilters = { ...filters, brands: newBrands };
        setFilters(newFilters);
        updateUrl(selectedCategory, null, newFilters);
    };

    const applyPriceFilter = () => {
        const newFilters = { ...filters, minPrice: tempMinPrice, maxPrice: tempMaxPrice };
        setFilters(newFilters);
        updateUrl(selectedCategory, null, newFilters);
    };

    const resetFilters = () => {
        const newFilters = { brands: [], minPrice: 0, maxPrice: 10000 };
        setFilters(newFilters);
        setTempMinPrice(0);
        setTempMaxPrice(10000);
        updateUrl(selectedCategory, null, newFilters);
    };

    const addToOrderItems = async (productId: number) => {
        if (!isAuthenticated) {
            setPendingProductId(productId);
            setShowAuthModal(true);
            return;
        }
        try {
            setLoadingCatalogData(true);
            await addToOrderItem(productId, currentUser?.login || '');
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error('Ошибка добавления:', error);
            throw error;
        } finally {
            setLoadingCatalogData(false);
        }
    };

    const handleAuthSuccess = () => {
        if (pendingProductId) {
            addToOrderItems(pendingProductId);
            setPendingProductId(null);
        }
    };

    const getProductCountForCategory = (categoryName: string) => {
        const category = categoriesData.find(c => c.name === categoryName);
        if (!category) return '0 товаров';
        const count = productData.filter(p => p.categories_Id === category.id).length;
        const word = count % 10 === 1 && count % 100 !== 11 ? 'товар' : (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? 'товара' : 'товаров');
        return `${count} ${word}`;
    };

    if (loadingCatalogData) return <LoadingSpinner />;

    if (selectedProduct) {
        return (
            <>
                <ProductDetails
                    selectedProduct={selectedProduct}
                    selectedCategoryData={selectedCategoryData}
                    manufacturerData={manufacturerData}
                    getProductStock={getProductStock}
                    onClose={handleCloseProduct}
                    onAddToCart={addToOrderItems}
                    apiUrl={api}
                    isAuthenticated={isAuthenticated}
                />
                <AuthModal
                    show={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            </>
        );
    }

    return (
        <Container fluid className={styles.container}>
            <Row className={styles.header}>
                <Col>
                    <h1 className={styles.title}>Каталог товаров</h1>
                    <p className={styles.subtitle}>Найдите необходимые запчасти по названию или артикулу</p>
                </Col>
            </Row>

            {!selectedCategory ? (
                <>
                    {/* Поисковая строка по центру */}
                    <Row className="justify-content-center mb-4">
                        <Col md={6} lg={5}>
                            <div className={styles.categorySearchContainer}>
                                <div className={styles.searchInputWrapper}>
                                    <input
                                        type="text"
                                        className={styles.categorySearchInput}
                                        placeholder="🔍 Поиск категорий..."
                                        value={categorySearchQuery}
                                        onChange={(e) => handleCategorySearchChange(e.target.value)}
                                        autoFocus
                                    />
                                    {categorySearchQuery && (
                                        <button
                                            className={styles.clearSearchBtn}
                                            onClick={handleClearCategorySearch}
                                            aria-label="Очистить поиск"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                {categorySearchQuery && filteredCategories.length === 0 && (
                                    <div className={styles.noCategoriesFound}>
                                        Категории не найдены
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <CategoriesList
                        categoriesData={filteredCategories}
                        onCategorySelect={handleCategoryChange}
                        getProductCountForCategory={getProductCountForCategory}
                    />
                </>
            ) : (
                selectedCategoryData && (
                    <Row>
                        <Col md={3} className="mb-4">
                            <Filters
                                searchQuery={searchQuery}
                                onSearchChange={handleSearchChange}
                                onSearch={() => { }}
                                onClearSearch={handleClearSearch}
                                availableBrands={availableBrands}
                                filters={filters}
                                onBrandChange={handleBrandChange}
                                tempMinPrice={tempMinPrice}
                                tempMaxPrice={tempMaxPrice}
                                onTempMinPriceChange={(e) => setTempMinPrice(e.target.value === '' ? 0 : parseInt(e.target.value))}
                                onTempMaxPriceChange={(e) => setTempMaxPrice(e.target.value === '' ? 0 : parseInt(e.target.value))}
                                onApplyPriceFilter={applyPriceFilter}
                                priceRange={priceRange}
                                onResetFilters={resetFilters}
                            />
                        </Col>
                        <Col md={9}>
                            <ProductsList
                                filteredProducts={filteredProducts}
                                manufacturerData={manufacturerData}
                                getProductStock={getProductStock}
                                onProductSelect={handleProductSelect}
                                onBackToCategories={() => handleCategoryChange(null)}
                                searchQuery={searchQuery}
                                selectedCategoryData={selectedCategoryData}
                                apiUrl={api}
                            />
                        </Col>
                    </Row>
                )
            )}

            <AuthModal
                show={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
            />
        </Container>
    );
};

declare global {
    interface Window {
        categorySearchTimeout?: NodeJS.Timeout;
        productSearchTimeout?: NodeJS.Timeout;
    }
}

export { CatalogPage };