import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { getShopAddress, AddressOrder } from '../servicesApi/AddressesApi';
import { getUsers, User } from '../servicesApi/UsersApi';

import styles from './Footer.module.css';

// Определяем тип для кэшированных данных
interface CachedData {
    adminUser: User | null;
    shopAddress: AddressOrder | null;
}

// Кэш для данных футера (за пределами компонента)
let cachedData: CachedData | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;
let isInitialized = false;
let authChangeTimeout: NodeJS.Timeout | null = null;
let lastAdminUserEmail: string | null = null;
let lastShopAddressString: string | null = null;

// Функция для сброса кэша и принудительного обновления
export const resetFooterCache = (): void => {
    cachedData = null;
    isLoading = false;
    loadPromise = null;
    isInitialized = false;
};

// Функция для принудительного обновления данных футера
export const refreshFooterData = async (): Promise<void> => {
    resetFooterCache();
    window.dispatchEvent(new CustomEvent('footerDataUpdate'));
};

const Footer: React.FC = () => {
    // Состояния для динамических данных
    const [adminUser, setAdminUser] = useState<User | null>(cachedData?.adminUser ?? null);
    const [shopAddress, setShopAddress] = useState<AddressOrder | null>(cachedData?.shopAddress ?? null);
    const [loading, setLoading] = useState<boolean>(!cachedData);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef<boolean>(true);
    const isDataLoaded = useRef<boolean>(false);
    const isUpdating = useRef<boolean>(false);

    const loadData = async (force: boolean = false): Promise<void> => {
        // Если уже идет обновление, пропускаем
        if (isUpdating.current && !force) {
            return;
        }

        // Если данные уже загружены и не принудительно, ничего не делаем
        if (cachedData !== null && !force) {
            if (isMounted.current && !isDataLoaded.current) {
                setAdminUser(cachedData.adminUser);
                setShopAddress(cachedData.shopAddress);
                setLoading(false);
                isDataLoaded.current = true;
            }
            return;
        }

        // Если уже идет загрузка, ждем её завершения
        if (loadPromise !== null && !force) {
            await loadPromise;
            const currentCachedData = cachedData as CachedData | null;
            if (isMounted.current && currentCachedData !== null && !isDataLoaded.current) {
                setAdminUser(currentCachedData.adminUser);
                setShopAddress(currentCachedData.shopAddress);
                setLoading(false);
                isDataLoaded.current = true;
            }
            return;
        }

        isUpdating.current = true;

        // Загружаемデータ
        const fetchData = async (): Promise<void> => {
            if (isLoading && !force) return;
            isLoading = true;

            if (isMounted.current && !isDataLoaded.current) {
                setLoading(true);
                setError(null);
            }

            try {
                const [users, addresses] = await Promise.all([
                    getUsers(),
                    getShopAddress()
                ]);

                const admin = users.find((user: User) => user.role === 'admin');
                const address = addresses && addresses.length > 0 ? addresses[0] : null;

                // Проверяем, изменились ли данные
                const newAdminUserEmail = admin?.email || null;
                const newAddressString = address ? `${address.city}-${address.street}-${address.house}` : null;

                const hasChanges = newAdminUserEmail !== lastAdminUserEmail || newAddressString !== lastShopAddressString;

                if (hasChanges || force) {
                    // Сохраняем в кэш
                    const newCachedData: CachedData = {
                        adminUser: admin || null,
                        shopAddress: address
                    };

                    cachedData = newCachedData;
                    lastAdminUserEmail = newAdminUserEmail;
                    lastShopAddressString = newAddressString;

                    if (isMounted.current) {
                        setAdminUser(newCachedData.adminUser);
                        setShopAddress(newCachedData.shopAddress);
                        setError(null);
                        isDataLoaded.current = true;
                    }
                }
            } catch (error: any) {
                console.error('Ошибка загрузки данных для футера:', error);
                if (isMounted.current) {
                    const errorMsg = error.serverMessage || error.message || 'Не удалось загрузить данные';
                    setError(errorMsg);
                }
            } finally {
                isLoading = false;
                loadPromise = null;
                if (isMounted.current) {
                    setLoading(false);
                }
                isUpdating.current = false;
            }
        };

        loadPromise = fetchData();
        await loadPromise;
    };

    useEffect(() => {
        isMounted.current = true;

        // Загружаем данные только один раз
        if (!isInitialized) {
            isInitialized = true;
            loadData();
        }

        const handleFooterUpdate = (): void => {
            if (!isMounted.current) return;
            // Сбрасываем флаг загрузки и кэш
            isDataLoaded.current = false;
            loadData(true);
        };

        // Используем debounce для события authChange и проверяем реальные изменения
        const handleAuthChange = (event: CustomEvent): void => {
            if (!isMounted.current) return;

            // Очищаем предыдущий таймаут
            if (authChangeTimeout) {
                clearTimeout(authChangeTimeout);
            }

            // Устанавливаем новый таймаут
            authChangeTimeout = setTimeout(() => {
                if (isMounted.current) {
                    // Проверяем, действительно ли изменились данные пользователя
                    const newUser = event.detail?.user;
                    const oldUserEmail = lastAdminUserEmail;
                    const newUserEmail = newUser?.role === 'admin' ? newUser?.email : null;

                    // Обновляем только если изменился администратор
                    if (oldUserEmail !== newUserEmail) {
                        isDataLoaded.current = false;
                        loadData(true);
                    }
                }
            }, 500);
        };

        window.addEventListener('footerDataUpdate', handleFooterUpdate);
        window.addEventListener('authChange', handleAuthChange as EventListener);

        return () => {
            isMounted.current = false;
            if (authChangeTimeout) {
                clearTimeout(authChangeTimeout);
            }
            window.removeEventListener('footerDataUpdate', handleFooterUpdate);
            window.removeEventListener('authChange', handleAuthChange as EventListener);
        };
    }, []);

    const getContactInfo = (): string => {
        if (loading) return 'Загрузка...';
        if (error) return 'Информация временно недоступна';
        return adminUser?.email || 'info@koleso-porshen.ru';
    };

    const getPhoneInfo = (): string => {
        if (loading) return 'Загрузка...';
        if (error) return 'Информация временно недоступна';
        return adminUser?.phoneNumber || '+7 (999) 123-45-67';
    };

    const getAddressInfo = (): string => {
        if (loading) return 'Загрузка...';
        if (error) return 'Информация временно недоступна';
        if (shopAddress) {
            return `г. ${shopAddress.city}, ул. ${shopAddress.street}, д. ${shopAddress.house}`;
        }
        return 'Москва, ул. Пальмовая, 13';
    };

    return (
        <footer className={styles.footer}>
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
                        <li className={styles.listItem}>
                            <Link to="/privacy-policy" className={styles.link}>
                                Политика конфиденциальности
                            </Link>
                        </li>
                        <li className={styles.listItem}>
                            <Link to="/terms-of-use" className={styles.link}>
                                Условия эксплуатации
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
                            {getContactInfo()}
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>📱</span>
                            {getPhoneInfo()}
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>📍</span>
                            {getAddressInfo()}
                        </li>
                        <li className={styles.contactItem}>
                            <span className={styles.contactIcon}>⏰</span> Круглосуточно
                        </li>
                    </ul>
                </div>
            </div>

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