import React, { useState } from 'react';
import {
    Package,
    Star,
    Truck,
    Shield,
    Filter,
    ChevronRight,
    Droplet,
    Wind,
    Gauge,
    Battery,
    Wrench,
    Sparkles,
    X
} from 'lucide-react';

import styles from './CatalogPage.module.css';

interface Product {
    id: number;
    name: string;
    category: string;
    categoryId: string;
    price: number;
    oldPrice?: number;
    rating: number;
    image: string;
    inStock: boolean;
    description: string;
    brand: string;
}

interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
    count: number;
    description: string;
    image: string;
}

const CatalogPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const categories: Category[] = [
        {
            id: 'oil-filters',
            name: 'Масляные фильтры',
            icon: <Droplet size={32} />,
            count: 24,
            description: 'Фильтры для масла различных производителей',
            image: 'https://via.placeholder.com/400x200'
        },
        {
            id: 'cabin-filters',
            name: 'Салонные фильтры',
            icon: <Wind size={32} />,
            count: 18,
            description: 'Фильтры салона для чистого воздуха',
            image: 'https://via.placeholder.com/400x200'
        },
        {
            id: 'air-filters',
            name: 'Воздушные фильтры',
            icon: <Wind size={32} />,
            count: 15,
            description: 'Фильтры для очистки воздуха двигателя',
            image: 'https://via.placeholder.com/400x200'
        },
        {
            id: 'fuel-filters',
            name: 'Топливные фильтры',
            icon: <Gauge size={32} />,
            count: 12,
            description: 'Фильтры для очистки топлива',
            image: 'https://via.placeholder.com/400x200'
        },
        {
            id: 'pistons',
            name: 'Поршни и кольца',
            icon: <Package size={32} />,
            count: 32,
            description: 'Поршни, кольца и комплектующие',
            image: 'https://via.placeholder.com/400x200'
        },
        {
            id: 'wheels',
            name: 'Колеса и шины',
            icon: <Gauge size={32} />,
            count: 45,
            description: 'Шины, диски и колесные аксессуары',
            image: 'https://via.placeholder.com/400x200'
        },
        {
            id: 'batteries',
            name: 'Аккумуляторы',
            icon: <Battery size={32} />,
            count: 16,
            description: 'Автомобильные аккумуляторы',
            image: 'https://via.placeholder.com/400x200'
        },
        {
            id: 'tools',
            name: 'Инструменты',
            icon: <Wrench size={32} />,
            count: 38,
            description: 'Инструменты для обслуживания',
            image: 'https://via.placeholder.com/400x200'
        }
    ];

    const products: Product[] = [
        {
            id: 1,
            name: "Фильтр масляный MANN-FILTER W 610/3",
            category: "Масляные фильтры",
            categoryId: 'oil-filters',
            price: 450,
            rating: 4.8,
            image: "https://via.placeholder.com/300x200",
            inStock: true,
            description: "Оригинальный масляный фильтр для легковых автомобилей",
            brand: "MANN-FILTER"
        },
        {
            id: 2,
            name: "Фильтр масляный Bosch 0451103316",
            category: "Масляные фильтры",
            categoryId: 'oil-filters',
            price: 520,
            oldPrice: 590,
            rating: 4.7,
            image: "https://via.placeholder.com/300x200",
            inStock: true,
            description: "Высококачественный масляный фильтр Bosch",
            brand: "Bosch"
        },
        {
            id: 3,
            name: "Фильтр салонный угольный MANN-FILTER CUK 2939",
            category: "Салонные фильтры",
            categoryId: 'cabin-filters',
            price: 890,
            rating: 4.9,
            image: "https://via.placeholder.com/300x200",
            inStock: true,
            description: "Угольный салонный фильтр для очистки воздуха",
            brand: "MANN-FILTER"
        },
        {
            id: 4,
            name: "Фильтр салонный обычный MANN-FILTER CU 2939",
            category: "Салонные фильтры",
            categoryId: 'cabin-filters',
            price: 590,
            rating: 4.6,
            image: "https://via.placeholder.com/300x200",
            inStock: true,
            description: "Стандартный салонный фильтр",
            brand: "MANN-FILTER"
        },
        {
            id: 5,
            name: "Фильтр воздушный MANN-FILTER C 25 108",
            category: "Воздушные фильтры",
            categoryId: 'air-filters',
            price: 680,
            rating: 4.8,
            image: "https://via.placeholder.com/300x200",
            inStock: true,
            description: "Воздушный фильтр для двигателя",
            brand: "MANN-FILTER"
        },
        {
            id: 6,
            name: "Фильтр топливный MANN-FILTER WK 31/2",
            category: "Топливные фильтры",
            categoryId: 'fuel-filters',
            price: 750,
            oldPrice: 820,
            rating: 4.7,
            image: "https://via.placeholder.com/300x200",
            inStock: true,
            description: "Топливный фильтр тонкой очистки",
            brand: "MANN-FILTER"
        }
    ];

    const filteredProducts = selectedCategory
        ? products.filter(p => p.categoryId === selectedCategory)
        : [];

    const selectedCategoryData = categories.find(c => c.id === selectedCategory);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Каталог товаров</h1>
                <p className={styles.subtitle}>
                    Выберите категорию для просмотра доступных товаров
                </p>
            </div>

            {/* Категории */}
            <div className={styles.categoriesGrid}>
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.selected : ''
                            }`}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        <div className={styles.categoryImage}>
                            <div className={styles.categoryIcon}>
                                {category.icon}
                            </div>
                        </div>
                        <div className={styles.categoryContent}>
                            <div className={styles.categoryHeader}>
                                <span className={styles.categoryName}>{category.name}</span>
                                <span className={styles.categoryCount}>{category.count} шт</span>
                            </div>
                            <p className={styles.categoryDescription}>{category.description}</p>
                            <div className={styles.categoryLink}>
                                <span>Просмотреть товары</span>
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Товары выбранной категории */}
            {selectedCategory && selectedCategoryData && (
                <div>
                    <div className={styles.productsHeader}>
                        <button
                            className={styles.backButton}
                            onClick={() => setSelectedCategory(null)}
                        >
                            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                            Назад к категориям
                        </button>
                        <button
                            className={styles.filterButton}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} />
                            Фильтры
                        </button>
                    </div>

                    <h2 className={styles.title} style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
                        {selectedCategoryData.name}
                    </h2>

                    {filteredProducts.length > 0 ? (
                        <div className={styles.productsGrid}>
                            {filteredProducts.map((product) => (
                                <div key={product.id} className={styles.productCard}>
                                    <div className={styles.productImage}>
                                        <Package size={48} />
                                    </div>
                                    <div className={styles.productContent}>
                                        <div className={styles.productBrand}>{product.brand}</div>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <p className={styles.productDescription}>{product.description}</p>

                                        <div className={styles.productRating}>
                                            {[...Array(5)].map((_, index) => (
                                                <Star
                                                    key={index}
                                                    size={14}
                                                    fill={index < Math.floor(product.rating) ? '#f1c40f' : 'none'}
                                                    color={index < Math.floor(product.rating) ? '#f1c40f' : '#bdc3c7'}
                                                />
                                            ))}
                                            <span style={{ fontSize: '0.8rem', color: '#7f8c8d', marginLeft: '5px' }}>
                                                {product.rating}
                                            </span>
                                        </div>

                                        <div className={styles.productPrice}>
                                            {product.price} ₽
                                            {product.oldPrice && (
                                                <span className={styles.oldPrice}>{product.oldPrice} ₽</span>
                                            )}
                                        </div>

                                        <div style={{ marginBottom: '10px' }}>
                                            <span className={`${styles.stockBadge} ${!product.inStock ? styles.outOfStockBadge : ''
                                                }`}>
                                                {product.inStock ? 'В наличии' : 'Нет в наличии'}
                                            </span>
                                        </div>

                                        <button
                                            className={styles.addToCartButton}
                                            disabled={!product.inStock}
                                        >
                                            Добавить в корзину
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Package size={48} />
                            <h3>В этой категории пока нет товаров</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export { CatalogPage }