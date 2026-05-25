import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

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
    onAddToCart: (productId: number) => Promise<void>;
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
    const navigate = useNavigate();
    const [addingToCart, setAddingToCart] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [cartError, setCartError] = useState<string | null>(null);
    const [showAuthWarning, setShowAuthWarning] = useState(false);

    const productStock = getProductStock(selectedProduct.id);
    const quantity = productStock?.totalQuantity ?? 0;
    const isInStock = quantity > 0;

    const imageSrc = imgError ? '/placeholder.jpg' : `${apiUrl}/${selectedProduct.image}`;

    const handleAddToCart = async () => {
        // Проверка авторизации
        if (!isAuthenticated) {
            setShowAuthWarning(true);
            setTimeout(() => setShowAuthWarning(false), 15000);
            return;
        }

        if (addingToCart) return;

        setAddingToCart(true);
        setCartError(null);
        try {
            await onAddToCart(selectedProduct.id);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error: any) {
            console.error('Ошибка добавления в корзину:', error);
            const errorMsg = error.serverMessage || error.message || 'Не удалось добавить товар в корзину';
            setCartError(errorMsg);
            setTimeout(() => setCartError(null), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleNavigateToLogin = () => {
        navigate('/personalAccount');
    };

    return (
        <Container fluid className={styles.pageContainer}>
            <Row className="mb-4">
                <Col>
                    <Button
                        className={styles.backButton}
                        onClick={onClose}
                    >
                        ← Назад к товарам
                    </Button>
                </Col>
            </Row>

            {/* Уведомление об успешном добавлении */}
            {showSuccess && (
                <Row className="mb-3">
                    <Col>
                        <div className={styles.successMessage}>
                            ✅ Товар успешно добавлен в корзину!
                        </div>
                    </Col>
                </Row>
            )}

            {/* Уведомление об ошибке добавления */}
            {cartError && (
                <Row className="mb-3">
                    <Col>
                        <div className={styles.errorAlert}>
                            ❌ {cartError}
                        </div>
                    </Col>
                </Row>
            )}

            {/* Предупреждение о необходимости авторизации */}
            {showAuthWarning && (
                <Row className="mb-3">
                    <Col>
                        <Alert
                            variant="warning"
                            className={styles.warningAlert}
                            onClose={() => setShowAuthWarning(false)}
                            dismissible
                        >
                            <Alert.Heading>🔒 Требуется авторизация</Alert.Heading>
                            <p>
                                Для добавления товара в корзину необходимо войти в аккаунт
                                или зарегистрироваться.
                            </p>
                            <hr />
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowAuthWarning(false)}
                                    size="sm"
                                >
                                    Закрыть
                                </Button>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Card className={styles.fullProductCard}>
                        <Row className="g-0">
                            <Col md={6}>
                                <Card.Img
                                    src={imageSrc}
                                    className={styles.fullProductImage}
                                    onError={() => setImgError(true)}
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
                                            disabled={!isInStock || addingToCart}
                                            onClick={handleAddToCart}
                                        >
                                            {addingToCart
                                                ? 'Добавление...'
                                                : (isInStock ? `🛒 Добавить в корзину` : '❌ Нет в наличии')}
                                        </Button>
                                        <Button
                                            className={styles.fullProductBuyButton}
                                            variant="outline-primary"
                                            onClick={() => window.location.href = '/orderItems'}
                                        >
                                            🚀 Перейти в корзину
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