import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './BasketPage.module.css';

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

    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(items =>
            items.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (id: number) => {
        setCartItems(items => items.filter(item => item.id !== id));
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
    const total = subtotal - discount + deliveryCost;

    return (
        <Container fluid className={styles.pageContainer}>
            {/* Заголовок */}
            <Row className="mb-4">
                <Col>
                    <h1 className={styles.title}>Корзина</h1>
                    <p className={styles.subtitle}>
                        {cartItems.length} {cartItems.length === 1 ? 'товар' : 'товаров'} в корзине
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
                                {cartItems.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemImage}>
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemCategory}>{item.category}</div>
                                            <h3 className={styles.itemName}>{item.name}</h3>
                                            <div className={styles.itemBrand}>{item.brand}</div>
                                            <div className={styles.itemArticle}>Арт: {item.articleNumber}</div>
                                        </div>
                                        <div className={styles.itemPrice}>
                                            <div className={styles.currentPrice}>{item.price} ₽</div>
                                            {item.oldPrice && (
                                                <div className={styles.oldPrice}>{item.oldPrice} ₽</div>
                                            )}
                                        </div>
                                        <div className={styles.itemQuantity}>
                                            <Button
                                                className={styles.quantityBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                −
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
                                            {item.price * item.quantity} ₽
                                        </div>
                                        <Button
                                            className={styles.removeBtn}
                                            onClick={() => removeItem(item.id)}
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
                                        <span>Товары ({cartItems.length} шт.)</span>
                                        <span>{subtotal} ₽</span>
                                    </div>
                                    
                                    <div className={styles.summaryRow}>
                                        <span>Доставка</span>
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