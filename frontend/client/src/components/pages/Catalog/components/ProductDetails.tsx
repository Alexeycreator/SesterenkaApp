import React from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';

import { Product } from '../../../servicesApi/ProductsApi';
import { Categories } from '../../../servicesApi/CategoriesApi';
import { Manufacturer } from '../../../servicesApi/ManufacturersApi';
import { StockWarehousesQuantity } from '../../../servicesApi/StocksApi';

import styles from '../CatalogPage.module.css';

interface ProductDetailsProps {
    selectedProduct: Product;
    selectedCategoryData: Categories | null | undefined;
    manufacturerData: Manufacturer[];
    getProductStock: (productId: number) => StockWarehousesQuantity | undefined;
    onClose: () => void;
    onAddToCart: (productId: number) => void;
    apiUrl: string;
    isAuthenticated: boolean;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
    selectedProduct,
    selectedCategoryData,
    manufacturerData,
    getProductStock,
    onClose,
    onAddToCart,
    apiUrl,
    isAuthenticated
}) => {
    const productStock = getProductStock(selectedProduct.id);
    const quantity = productStock?.totalQuantity ?? 0;
    const isInStock = quantity > 0;

    return (
        <Container fluid className={styles.pageContainer}>
            <Row className="mb-4">
                <Col>
                    <Button
                        variant="link"
                        className={styles.backButton}
                        onClick={onClose}
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
                                    src={`${apiUrl}/${selectedProduct.image}`}
                                    className={styles.fullProductImage}
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder.jpg';
                                    }}
                                />
                            </Col>
                            <Col md={6}>
                                <Card.Body className={styles.fullProductBody}>
                                    <div className={styles.fullProductHeader}>
                                        <Badge className={styles.categoryBadge}>
                                            {selectedCategoryData?.name}
                                        </Badge>
                                        <Badge className={isInStock ? styles.inStockBadge : styles.outOfStockBadge}>
                                            {isInStock ? `В наличии: ${quantity} шт.` : 'Нет в наличии'}
                                        </Badge>
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
                                    <div className={styles.fullProductActions}>
                                        <Button
                                            className={styles.fullProductAddToCartButton}
                                            disabled={!isInStock}
                                            onClick={() => onAddToCart(selectedProduct.id)}
                                        >
                                            {isInStock ? `🛒 Добавить в корзину` : '❌ Нет в наличии'}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};