import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';

import { Product } from '../../../servicesApi/ProductsApi';
import { Manufacturer } from '../../../servicesApi/ManufacturersApi';
import { StockWarehousesQuantity } from '../../../servicesApi/StocksApi';

import styles from '../CatalogPage.module.css';

interface ProductCardProps {
    product: Product;
    manufacturerData: Manufacturer[];
    getProductStock: (productId: number) => StockWarehousesQuantity | undefined;
    onProductSelect: (product: Product) => void;
    apiUrl: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    manufacturerData,
    getProductStock,
    onProductSelect,
    apiUrl
}) => {
    const productStock = getProductStock(product.id);
    const isInStock = (productStock?.totalQuantity ?? 0) > 0;

    return (
        <Card
            className={`h-100 ${styles.productCard}`}
            onClick={() => onProductSelect(product)}
        >
            <div className={styles.productImageWrapper}>
                <Card.Img
                    variant="top"
                    src={`${apiUrl}/${product.image}`}
                    className={styles.productImage}
                    onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg';
                    }}
                />
                {!isInStock && (
                    <Badge className={styles.outOfStockBadge}>
                        Нет в наличии
                    </Badge>
                )}
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
    );
};