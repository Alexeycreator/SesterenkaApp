import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getShopAddress, AddressOrder } from '../servicesApi/AddressesApi';
import { getUsers, User } from '../servicesApi/UsersApi';

import styles from './Footer.module.css';

const Footer = () => {
    // Состояния для динамических данных
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [shopAddress, setShopAddress] = useState<AddressOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [users, addresses] = await Promise.all([
                    getUsers(),
                    getShopAddress()
                ]);

                const admin = users.find(user => user.role === 'admin');
                setAdminUser(admin || null);

                if (addresses && addresses.length > 0) {
                    setShopAddress(addresses[0]);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных для футера:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                        <span className={styles.sectionIcon}>🔧</span> О компании
                    </h4>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <Link to="/information" className={styles.link}>
                                О нас
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Покупателям */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🛒</span> Покупателям
                    </h4>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <Link to="/catalog" className={styles.link}>
                                Все товары
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
                            <span className={styles.contactIcon}>📧</span>
                            {loading ? 'Загрузка...' : (adminUser?.email || 'info@koleso-porshen.ru')}
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>📱</span>
                            {loading ? 'Загрузка...' : (adminUser?.phoneNumber || '+7 (999) 123-45-67')}
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>📍</span>
                            {loading ? 'Загрузка...' : (shopAddress ? `г. ${shopAddress.city}, ул. ${shopAddress.street}, д. ${shopAddress.house}` : 'Москва, ул. Пальмовая, 13')}
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>⏰</span> Круглосуточно
                        </li>
                    </ul>
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