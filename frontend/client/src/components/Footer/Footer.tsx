import React from 'react';
import { Link } from 'react-router-dom';

import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            {/* Декоративный верхний элемент */}
            <div className={styles.decorativeTop}>
                Колесо и поршень
            </div>

            <div className={styles.container}>
                {/* О нас */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🏜️</span> О компании
                    </h4>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <Link to="/information" className={styles.link}>
                                О нас
                            </Link>
                        </li>
                        <li className={styles.listItem}>
                            <Link to="/information#quality" className={styles.link}>
                                Качество продукта
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Покупателям */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🧳</span> Покупателям
                    </h4>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <Link to="/catalog" className={styles.link}>
                                Все товары
                            </Link>
                        </li>
                        <li className={styles.listItem}>
                            <Link to="/sale_items" className={styles.link}>
                                Товары со скидкой
                            </Link>
                        </li>
                        <li className={styles.listItem}>
                            <Link to="/help" className={styles.link}>
                                Помощь
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Контакты */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📞</span> Контакты
                    </h4>
                    <ul className={styles.list}>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>📧</span> vm96276915@gmail.com
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>📱</span> +7 (901) 339-95-22
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>📍</span> Москва, ул. Пальмовая, 13
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>⏰</span> Пн-Пт: 8:00 - 22:00
                        </li>
                    </ul>
                </div>
            </div>

            {/* Нижняя часть с копирайтом и доп. информацией */}
            <div className={styles.bottomSection}>
                <div className={styles.copyright}>© 2026 Колесо и поршень. Все права защищены.</div>
                <div className={styles.links}>
                    <Link to="/privacy_policy" className={styles.bottomLink}>
                        Политика конфиденциальности
                    </Link>
                    <span className={styles.separator}>|</span>
                    <Link to="/terms_of_use" className={styles.bottomLink}>
                        Условия использования
                    </Link>
                </div>
            </div>

            {/* Дополнительная информация о компании */}
            <div className={styles.companyInfo}>
                <p>
                    Магазин «Колесо и поршень» предлагает лучшие запчасти для машины по всему миру с 2015 года.
                    Более 10 000 довольных клиентов.
                </p>
            </div>
        </footer>
    );
};

export default Footer;