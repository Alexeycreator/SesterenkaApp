import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import LoadingSpinner from '../../LoadingSpinner';
import { getOrderItemData, OrderItem, OrderItemDto } from '../../servicesApi/OrderItemsApi';

import styles from './BasketPage.module.css';
import { deleteOrderItem } from '../../servicesApi/BasketApi';
import { getProducts, Product } from '../../servicesApi/ProductsApi';

interface CartItem {
    id: number;
    name: string;
    brand: string;
    articleNumber: string;
    price: number;
    oldPrice?: number;
    quantity: number;
    image: string;
    inStock: boolean;
    category: string;
}

const BasketPage = () => {
    const api = process.env.REACT_APP_API_URL_IMAGES || 'http://localhost:5027';
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: 1,
            name: "Фильтр масляный MANN-FILTER W 610/3",
            brand: "MANN-FILTER",
            articleNumber: "W 610/3",
            price: 450,
            quantity: 2,
            image: "https://via.placeholder.com/100x100",
            inStock: true,
            category: "Масляные фильтры"
        },
        {
            id: 3,
            name: "Фильтр салонный угольный MANN-FILTER CUK 2939",
            brand: "MANN-FILTER",
            articleNumber: "CUK 2939",
            price: 890,
            quantity: 1,
            image: "https://via.placeholder.com/100x100",
            inStock: true,
            category: "Салонные фильтры"
        },
        {
            id: 5,
            name: "Фильтр воздушный MANN-FILTER C 25 108",
            brand: "MANN-FILTER",
            articleNumber: "C 25 108",
            price: 680,
            oldPrice: 720,
            quantity: 1,
            image: "https://via.placeholder.com/100x100",
            inStock: true,
            category: "Воздушные фильтры"
        }
    ]);

    // состояние корзины
    const [orderItemData, setOrderItemData] = useState<OrderItem | null>(null);
    const [loadingOrderItem, setLoadingOrderItem] = useState(true);
    const [errorOrderItem, setErrorOrderItem] = useState<string | null>(null);

    // состояние товаров
    const [productData, setProductData] = useState<OrderItemDto[]>([]);
    const [productIdData, setProductIdData] = useState<Product[]>([]);

    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);

    // получение позиций корзины
    const fetchOrderItem = async () => {
        try {
            setLoadingOrderItem(true);
            const orderItem = await getOrderItemData();
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

    // функция обновления количества одного товара
    // const updateQuantity = (id: number, newQuantity: number) => {
    //     if (newQuantity < 1) return;
    //     setOrderItemData(items =>
    //         items?.map(item =>
    //             item.id === id ? { ...item, quantity: newQuantity } : item
    //         )
    //     );
    // };

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

    const applyPromoCode = () => {
        if (promoCode.toLowerCase() === 'porshen10') {
            setPromoApplied(true);
            setPromoDiscount(10);
        } else {
            alert('Неверный промокод');
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = promoApplied ? subtotal * (promoDiscount / 100) : 0;
    const deliveryCost = 300;
    const total = (orderItemData?.totalAmount || 0) - (discount || 0) + (deliveryCost || 0);

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
                        {/* {orderItemData?.products.length} {orderItemData?.products.length === 1 ? 'товар' : 'товаров'} в корзине */}
                    </p>
                </Col>
            </Row>

            {cartItems.length === 0 ? (
                // Пустая корзина
                <Row className="justify-content-center">
                    <Col md={6}>
                        <div className={styles.emptyCart}>
                            <div className={styles.emptyCartIcon}>🛒</div>
                            <h2 className={styles.emptyCartTitle}>Корзина пуста</h2>
                            <p className={styles.emptyCartText}>
                                Добавьте товары в корзину, чтобы оформить заказ
                            </p>
                            <Link
                                to="/catalog"
                                className={styles.continueShoppingButton}
                            >
                                Перейти в каталог
                            </Link>
                        </div>
                    </Col>
                </Row>
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
                                                // onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </Button>
                                            <span className={styles.quantityValue}>{item.quantity}</span>
                                            <Button
                                                className={styles.quantityBtn}
                                                // onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                                        <span>Товары ({productData.length} шт.)</span>
                                        <span>{orderItemData?.totalAmount} ₽</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Доставка (нет в БД)</span>
                                        <span>{deliveryCost} ₽</span>
                                    </div>
                                    {promoApplied && (
                                        <div className={styles.summaryRow}>
                                            <span>Скидка ({promoDiscount}%)</span>
                                            <span className={styles.discountAmount}>-{discount} ₽</span>
                                        </div>
                                    )}
                                    <div className={styles.summaryRow}>
                                        <span>Итого</span>
                                        <span className={styles.totalAmount}>{total} ₽</span>
                                    </div>

                                    {/* Промокод */}
                                    <div className={styles.promoSection}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Введите промокод"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className={styles.promoInput}
                                            disabled={promoApplied}
                                        />
                                        <Button
                                            className={styles.promoButton}
                                            onClick={applyPromoCode}
                                            disabled={promoApplied || !promoCode}
                                        >
                                            Применить
                                        </Button>
                                    </div>

                                    <Button
                                        className={styles.checkoutButton}
                                        size="lg"
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

export { BasketPage };