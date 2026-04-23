import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

import { Product } from '../../../servicesApi/ProductsApi';
import { Manufacturer } from '../../../servicesApi/ManufacturersApi';
import { StockWarehousesQuantity } from '../../../servicesApi/StocksApi';
import { ProductCard } from './ProductCard';

import styles from '../CatalogPage.module.css';

interface ProductsListProps {
    filteredProducts: Product[];
    manufacturerData: Manufacturer[];
    getProductStock: (productId: number) => StockWarehousesQuantity | undefined;
    onProductSelect: (product: Product) => void;
    onBackToCategories: () => void;
    searchQuery: string;
    selectedCategoryData: { icon: string; name: string } | null;
    apiUrl: string;
}

export const ProductsList: React.FC<ProductsListProps> = ({
    filteredProducts,
    manufacturerData,
    getProductStock,
    onProductSelect,
    onBackToCategories,
    searchQuery,
    selectedCategoryData,
    apiUrl
}) => {
    return (
        <>
            <Row className="mb-4">
                <Col>
                    <Button
                        variant="link"
                        className={styles.backButton}
                        onClick={onBackToCategories}
                    >
                        ← Назад к категориям
                    </Button>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <h2 className={styles.categoryHeaderTitle}>
                        {selectedCategoryData?.icon} {selectedCategoryData?.name}
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
                            <ProductCard
                                product={product}
                                manufacturerData={manufacturerData}
                                getProductStock={getProductStock}
                                onProductSelect={onProductSelect}
                                apiUrl={apiUrl}
                            />
                        </Col>
                    ))}
                    <div>
                        <Row className="mb-4">
                            <Col>
                                <Button
                                    variant="link"
                                    className={styles.backButton}
                                    onClick={onBackToCategories}
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
                        onClick={onBackToCategories}
                        className={styles.resetButton}
                    >
                        ← Назад к категориям
                    </Button>
                </div>
            )}
        </>
    );
};