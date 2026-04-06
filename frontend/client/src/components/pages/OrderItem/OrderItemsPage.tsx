import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import LoadingSpinner from '../../LoadingSpinner';
import { getOrderItemData, OrderItem, OrderItemDto, updateOrderItemQuantity, deleteOrderItem } from '../../servicesApi/OrderItemsApi';
import { getProducts, Product } from '../../servicesApi/ProductsApi';
import { useAuth } from '../../../contexts/AuthContext';

import styles from './OrderItemsPage.module.css';

const OrderItemsPage = () => {
    const api = process.env.REACT_APP_API_URL_IMAGES || 'http://localhost:5027';
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated } = useAuth();

    // состояние корзины
    const [orderItemData, setOrderItemData] = useState<OrderItem | null>(null);
    const [loadingOrderItem, setLoadingOrderItem] = useState(true);
    const [errorOrderItem, setErrorOrderItem] = useState<string | null>(null);

    // состояние товаров
    const [productData, setProductData] = useState<OrderItemDto[]>([]);
    const [productIdData, setProductIdData] = useState<Product[]>([]);

    // получение позиций корзины
    const fetchOrderItem = async () => {
        try {
            setLoadingOrderItem(true);
            const orderItem = await getOrderItemData(currentUser?.id || 0, currentUser?.login || '', currentUser?.role || '');
            setOrderItemData(orderItem);
            if (orderItem != null) {
                const products = orderItem.items;
                setProductData(products);
            }
        }
        catch (err: any) {
            console.error('Ошибка загрузки данных корзины:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorOrderItem(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorOrderItem(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorOrderItem('Ошибка соединения с сервером');
            }
        }
        finally {
            setLoadingOrderItem(false);
        }
    };

    const fetchProductIdData = async () => {
        try {
            setLoadingOrderItem(true);
            const products = await getProducts();
            setProductIdData(products);
        }
        catch (err: any) {
            console.error('Ошибка загрузки данных товара:', err);
            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    const serverMessage = err.response.data?.message || 'Информация не найдена';
                    setErrorOrderItem(serverMessage);
                    navigate('/404', { replace: true });
                } else {
                    setErrorOrderItem(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setErrorOrderItem('Ошибка соединения с сервером');
            }
        }
        finally {
            setLoadingOrderItem(false);
        }
    }

    // хуки
    useEffect(() => {
        fetchOrderItem();
    }, []);

    useEffect(() => {
        fetchProductIdData();
    }, []);

    // метод для поиска товара
    const findProduct = (partNumber: string) => {
        try {
            const product = productIdData.find((p) => p.partNumber === partNumber);
            if (product) {
                return product.id;
            } else {
                console.warn('Товар с артикулом: ', partNumber, ' не найден');
                return null;
            }
        }
        catch (error: any) {
            console.error(error);
        }
    };

    // функция обновления количества одного товара
    const updateQuantity = async (id: number, newQuantity: number) => {
        if (newQuantity < 1) {
            return;
        }
        setProductData(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );

        try {
            const result = await updateOrderItemQuantity(id, newQuantity);

            if (result) {
                setProductData(result.items);
                setOrderItemData(result);
            }
        } catch (error: any) {
            setProductData(prevItems =>
                prevItems.map(item =>
                    item.id === id ? { ...item, quantity: item.quantity } : item
                )
            );
            if (error.serverMessage) {
                console.error(error.serverMessage);
            } else {
                console.warn('Не удалось обновить количество');
            }
        }
        fetchOrderItem();
    };

    // метод удаления товара из корзины
    const removeItem = async (partNumber: string) => {
        try {
            setLoadingOrderItem(true);
            const id = findProduct(partNumber);
            if (id != null) {
                await deleteOrderItem(id);
            }

            // Обновляем корзину после удаления
            await fetchOrderItem();

        } catch (error: any) {
            console.error('Ошибка удаления:', error);

            // Показываем сообщение об ошибке пользователю
            if (error.serverMessage) {
                console.error(error.serverMessage);
            } else if (error.message) {
                console.error(error.message);
            } else {
                console.error('Не удалось удалить товар из корзины');
            }
            if (error.statusCode === 404) {
                await fetchOrderItem();
            }
        } finally {
            setLoadingOrderItem(false);
        }
    };

    const handleOrders = () => {
        try {
            // const response = await 
        }
        catch (err: any) {
            console.error(err);
        }
        finally {
            navigate('/order');
        }
    };

    if (loadingOrderItem) {
        return <LoadingSpinner />
    }
    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <h1 className={styles.title}>Корзина</h1>
                    <p className={styles.subtitle}>
                        {orderItemData?.items.length} {orderItemData?.items.length === 1 ? 'товар' : 'товаров'} в корзине
                    </p>
                </Col>
            </Row>

            {orderItemData?.items.length === 0 ? (
                // Пустая корзина
                <Container fluid className={styles.pageContainer}>
                    <div className={styles.emptyCart}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h2>Корзина пуста</h2>
                        <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                        <Button onClick={() => navigate('/catalog')} className={styles.continueButton}>
                            Перейти в каталог
                        </Button>
                    </div>
                </Container>
            ) : (
                <>
                    {/* Список товаров */}
                    <Row>
                        <Col lg={8}>
                            <div className={styles.cartItems}>
                                {productData?.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemImage}>
                                            <img
                                                src={`${api}/${item.imageProduct}`}
                                                alt={item.nameProducts}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemCategory}>{item.nameCategories}</div>
                                            <h3 className={styles.itemName}>{item.nameProducts}</h3>
                                            <div className={styles.itemBrand}>{item.nameManufacturers}</div>
                                            <div className={styles.itemArticle}>Арт: {item.partNumber}</div>
                                        </div>
                                        <div className={styles.itemPrice}>
                                            <div className={styles.currentPrice}>{item.priceAtMoment} ₽</div>
                                        </div>
                                        <div className={styles.itemQuantity}>
                                            <Button
                                                className={styles.quantityBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </Button>
                                            <span className={styles.quantityValue}>{item.quantity}</span>
                                            <Button
                                                className={styles.quantityBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                        <div className={styles.itemTotal}>
                                            {item.totalPrice} ₽
                                        </div>
                                        <Button
                                            className={styles.removeBtn}
                                            onClick={() => removeItem(item.partNumber)}
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Col>

                        {/* Итоговая информация */}
                        <Col lg={4}>
                            <Card className={styles.orderSummary}>
                                <Card.Body>
                                    <h3 className={styles.summaryTitle}>Ваш заказ</h3>
                                    <div className={styles.summaryRow}>
                                        <span>Товары ({orderItemData?.totalQuantity} шт.)</span>
                                        <span>{orderItemData?.totalAmount} ₽</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Итого</span>
                                        <span className={styles.totalAmount}>{orderItemData?.totalAmount || 0} ₽</span>
                                    </div>
                                    <Button
                                        className={styles.checkoutButton}
                                        size="lg"
                                        onClick={handleOrders}
                                    >
                                        Оформить заказ
                                    </Button>

                                    <Link
                                        to="/catalog"
                                        className={styles.continueLink}
                                    >
                                        Продолжить покупки
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export { OrderItemsPage };