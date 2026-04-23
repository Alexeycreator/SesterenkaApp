import React, { Component, createRef } from "react";
import { Link } from 'react-router-dom';

import { authApi, UserData } from "../../service/IndexAuth";
import { AuthContext } from '../../contexts/AuthContext';
import { getOrderItemData, OrderItem } from "../servicesApi/OrderItemsApi";
import { NavMenu } from './components/NavMenu';
import { AuthModal } from './components/AuthModal';
import RegistrationModal from './components/RegistrationModal';
import { UserMenu } from './components/UserMenu';
import { clientApi } from '../../service/user/Requests';

import styles from './Header.module.css';

interface RegistrationFormData {
    firstName: string;
    secondName: string;
    surName: string | null;
    email: string;
    phone: string;
    gender: 'Мужской' | 'Женский';
    birthDay: string;
    password: string;
    confirmPassword: string;
    agreeToNews: boolean;
    agreeToPersonalData: boolean;
}

interface HeaderState {
    showAuth: boolean;
    showRegistrationModal: boolean;
    user: UserData | null;
    registrationForm: RegistrationFormData;
    registrationStep: 1 | 2;
    registrationLoading: boolean;
    registrationError: string | null;
    registrationFieldErrors: Record<string, string>;
    authForm: { login: string; password: string; };
    authLoading: boolean;
    authError: string | null;
    authFieldErrors: { login?: string; password?: string; };
    showPassword: boolean;
    errors: Record<string, string>;
    showUserMenu: boolean;
    cartItemsCount: number;
}

export default class Header extends Component<{}, HeaderState> {
    static contextType = AuthContext;
    context!: React.ContextType<typeof AuthContext>;

    private userMenuRef = createRef<HTMLDivElement>();
    private fetchTimeout: NodeJS.Timeout | null = null;
    private isFetching = false;
    private lastFetchTime = 0;
    private readonly FETCH_DELAY = 1000;

    private readonly initialRegistrationForm: RegistrationFormData = {
        firstName: '',
        secondName: '',
        surName: '',
        email: '',
        phone: '',
        gender: 'Мужской',
        birthDay: '',
        password: '',
        confirmPassword: '',
        agreeToNews: false,
        agreeToPersonalData: false
    };

    state: HeaderState = {
        showAuth: false,
        showRegistrationModal: false,
        user: null,
        registrationForm: { ...this.initialRegistrationForm },
        registrationStep: 1,
        registrationLoading: false,
        registrationError: null,
        registrationFieldErrors: {},
        authForm: { login: '', password: '' },
        authLoading: false,
        authError: null,
        authFieldErrors: {},
        showPassword: false,
        errors: {},
        showUserMenu: false,
        cartItemsCount: 0,
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);

        const { isAuthenticated } = this.context || {};
        if (isAuthenticated) {
            this.fetchCartItemsCount();
        }

        window.addEventListener('cartUpdated', this.handleCartUpdate);
    }

    componentDidUpdate(prevProps: {}, prevState: HeaderState) {
        const currentUser = this.context?.user;
        const prevUser = prevState.user;

        if (prevUser !== currentUser) {
            const { isAuthenticated } = this.context || {};
            if (isAuthenticated && currentUser) {
                this.fetchCartItemsCount();
            } else {
                this.setState({ cartItemsCount: 0 });
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        window.removeEventListener('cartUpdated', this.handleCartUpdate);

        if (this.fetchTimeout) {
            clearTimeout(this.fetchTimeout);
        }
    }

    handleCartUpdate = () => {
        const { isAuthenticated, user } = this.context || {};
        if (isAuthenticated && user) {
            this.fetchCartItemsCount();
        }
    };

    fetchCartItemsCount = async () => {
        const { user, isAuthenticated } = this.context || {};

        if (!isAuthenticated || !user) {
            this.setState({ cartItemsCount: 0 });
            return;
        }

        const now = Date.now();
        if (this.isFetching) return;
        if (now - this.lastFetchTime < this.FETCH_DELAY) return;

        this.isFetching = true;
        this.lastFetchTime = now;

        try {
            const orderItem = await getOrderItemData(user.login || '', user.role || '');

            if (orderItem && orderItem.items && orderItem.items.length > 0) {
                const totalCount = orderItem.items.reduce((sum, item) => sum + item.quantity, 0);
                this.setState({ cartItemsCount: totalCount });
            } else {
                this.setState({ cartItemsCount: 0 });
            }
        } catch (error: any) {
            if (error.statusCode !== 404) {
                console.error('Не удалось загрузить корзину:', error.message || error.serverMessage);
            }
            this.setState({ cartItemsCount: 0 });
        } finally {
            this.isFetching = false;
        }
    };

    toggleAuthModal = () => {
        this.setState(prev => ({
            showAuth: !prev.showAuth,
            authError: null,
            authFieldErrors: {},
            authForm: { login: '', password: '' }
        }));
    };

    handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        this.setState(prev => ({
            authForm: { ...prev.authForm, [name]: value },
            authFieldErrors: { ...prev.authFieldErrors, [name]: undefined },
            authError: null
        }));
    };

    validateAuthForm = (): boolean => {
        const { login, password } = this.state.authForm;
        const errors: { login?: string; password?: string } = {};

        if (!login.trim()) errors.login = 'Введите логин или email';
        if (!password) errors.password = 'Введите пароль';

        this.setState({ authFieldErrors: errors });
        return Object.keys(errors).length === 0;
    };

    handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!this.validateAuthForm()) return;

        this.setState({ authLoading: true, authError: null });

        try {
            const { login, password } = this.state.authForm;
            await this.context!.login(login, password);

            this.setState({
                showAuth: false,
                authForm: { login: '', password: '' },
                authError: null,
                authFieldErrors: {}
            });

            await this.fetchCartItemsCount();
            const event = new CustomEvent('cartUpdated');
            window.dispatchEvent(event);
        } catch (error: any) {
            if (error.response?.status === 401) {
                this.setState({
                    authError: 'Неверный логин или пароль',
                    authFieldErrors: { login: 'Пользователь не найден', password: 'Неверный пароль' }
                });
            } else if (error.request) {
                this.setState({ authError: 'Сервер не отвечает. Проверьте подключение' });
            } else {
                this.setState({ authError: 'Произошла ошибка. Попробуйте снова' });
            }
        } finally {
            this.setState({ authLoading: false });
        }
    };

    handleLogout = () => {
        this.context!.logout();
        this.setState({
            showUserMenu: false,
            cartItemsCount: 0
        });
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
    };

    switchToRegistration = () => {
        this.setState({
            showAuth: false,
            showRegistrationModal: true,
            registrationForm: { ...this.initialRegistrationForm },
            registrationStep: 1,
            registrationError: null,
            registrationFieldErrors: {}
        });
    };

    switchToAuth = () => {
        this.setState({
            showRegistrationModal: false,
            showAuth: true,
            registrationForm: { ...this.initialRegistrationForm },
            registrationStep: 1
        });
    };

    handleClickOutside = (event: MouseEvent) => {
        // Только для меню пользователя
        if (this.userMenuRef.current && !this.userMenuRef.current.contains(event.target as Node)) {
            this.setState({ showUserMenu: false });
        }
    };

    validateRegistrationStep1 = (): boolean => {
        const form = this.state.registrationForm;
        const errors: Record<string, string> = {};

        if (!form.secondName.trim()) errors.secondName = 'Введите фамилию';
        if (!form.firstName.trim()) errors.firstName = 'Введите имя';
        if (!form.surName?.trim()) errors.surName = 'Введите отчество';
        if (!form.email.trim()) {
            errors.email = 'Введите email';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = 'Введите корректный email';
        }
        if (!form.phone.trim()) {
            errors.phone = 'Введите телефон';
        } else if (!/^(\+7|7|8)\d{10}$/.test(form.phone)) {
            errors.phone = 'Формат: +7XXXXXXXXXX';
        }
        if (!form.birthDay) errors.birthDay = 'Выберите дату рождения';

        this.setState({ registrationFieldErrors: errors });
        return Object.keys(errors).length === 0;
    };

    validateRegistrationStep2 = (): boolean => {
        const form = this.state.registrationForm;
        const errors: Record<string, string> = {};

        if (!form.password) {
            errors.password = 'Введите пароль';
        } else if (form.password.length < 6) {
            errors.password = 'Минимум 6 символов';
        }
        if (form.password !== form.confirmPassword) {
            errors.confirmPassword = 'Пароли не совпадают';
        }
        if (!form.agreeToPersonalData) {
            errors.agreeToPersonalData = 'Необходимо согласие';
        }

        this.setState({ registrationFieldErrors: errors });
        return Object.keys(errors).length === 0;
    };

    handleRegistrationNext = () => {
        if (this.validateRegistrationStep1()) {
            this.setState({ registrationStep: 2 });
        }
    };

    handleRegistrationBack = () => {
        this.setState({ registrationStep: 1 });
    };

    calculateAge = (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    handleRegistrationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!this.validateRegistrationStep2()) return;

        this.setState({ registrationLoading: true, registrationError: null });

        try {
            const form = this.state.registrationForm;

            // Рассчитываем возраст
            const age = this.calculateAge(form.birthDay);

            // Проверяем возраст
            if (age < 0 || age > 100) {
                this.setState({ registrationError: 'Возраст должен быть от 0 до 100 лет' });
                this.setState({ registrationLoading: false });
                return;
            }

            // Формируем данные для регистрации в соответствии с CreateUserDto на сервере
            const registerData = {
                secondName: form.secondName,           // Фамилия
                firstName: form.firstName,              // Имя
                surName: form.surName || null,          // Отчество (может быть null)
                gender: form.gender,                    // Пол (Мужской/Женский)
                birthday: form.birthDay,                // Дата рождения (YYYY-MM-DD)
                age: age,                               // Возраст (рассчитанный)
                phoneNumber: form.phone,                // Телефон
                email: form.email,                      // Email
                login: form.email,                      // Логин (используем email как логин)
                password: form.password,                // Пароль
                role: "user",                           // Роль (по умолчанию "user")
                position: "пользователь"                // Должность (заполняем как "пользователь")
            };

            console.log('Отправка данных регистрации:', registerData);

            // Используем clientApi.create для регистрации
            await clientApi.create(registerData);

            // После успешной регистрации автоматически входим
            await this.context!.login(form.email, form.password);

            this.setState({
                showRegistrationModal: false,
                registrationForm: { ...this.initialRegistrationForm },
                registrationStep: 1,
                registrationError: null,
                registrationFieldErrors: {}
            });

            await this.fetchCartItemsCount();
            const event = new CustomEvent('cartUpdated');
            window.dispatchEvent(event);

            console.log('Регистрация и вход выполнены успешно');
        } catch (error: any) {
            console.error('Ошибка регистрации:', error);
            if (error.statusCode === 409) {
                this.setState({ registrationError: 'Пользователь с таким email, телефоном или логином уже существует' });
            } else if (error.statusCode === 400) {
                // Парсим валидационные ошибки
                const errorData = error.data;
                if (errorData?.errors) {
                    const errorMessages = Object.values(errorData.errors).flat().join(', ');
                    this.setState({ registrationError: `Ошибка валидации: ${errorMessages}` });
                } else {
                    this.setState({ registrationError: error.data?.message || 'Неверные данные. Проверьте правильность заполнения полей' });
                }
            } else {
                this.setState({ registrationError: error.message || 'Ошибка при регистрации. Попробуйте позже' });
            }
        } finally {
            this.setState({ registrationLoading: false });
        }
    };

    toggleRegistrationModal = () => {
        this.setState(prevState => ({
            showRegistrationModal: !prevState.showRegistrationModal,
            showAuth: false
        }));
    };

    handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        this.setState(prev => ({
            registrationForm: {
                ...prev.registrationForm,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    toggleUserMenu = () => {
        this.setState(prev => ({ showUserMenu: !prev.showUserMenu }));
    };

    render() {
        const { showAuth, showRegistrationModal, registrationForm, showPassword, errors, cartItemsCount } = this.state;
        const user = this.context?.user;
        const isAuthenticated = this.context?.isAuthenticated;

        return (
            <>
                <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
                    <div className={`container-fluid ${styles.container}`}>
                        <Link to="/" className={`navbar-brand ${styles.logo}`}>
                            <span>Колесо и поршень</span>
                        </Link>

                        <button
                            className={`navbar-toggler ${styles.navbarToggler}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent"
                            aria-label="Toggle navigation"
                        >
                            <span className={`navbar-toggler-icon ${styles.navbarTogglerIcon}`}></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <NavMenu />

                            <div className={styles.rightSection}>
                                <Link to="/orderItems" className={styles.cartLink}>
                                    <span className={styles.cartIcon}>🛒</span>
                                    {isAuthenticated && (
                                        <span className={styles.cartBadge}>{cartItemsCount}</span>
                                    )}
                                </Link>

                                {user ? (
                                    <div className={styles.userMenuWrapper} ref={this.userMenuRef}>
                                        <button className={styles.userAvatar} onClick={this.toggleUserMenu}>
                                            <span className={styles.userIcon}>👤</span>
                                            <span className={styles.userName}>{user.firstName}</span>
                                            <span className={styles.dropdownArrow}>▼</span>
                                        </button>
                                        {this.state.showUserMenu && (
                                            <UserMenu user={user} onLogout={this.handleLogout} />
                                        )}
                                    </div>
                                ) : (
                                    <button className={styles.authButton} onClick={this.toggleAuthModal}>
                                        <span className={styles.authIcon}>🔑</span>
                                        <span>Вход</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <AuthModal
                    show={showAuth}
                    onClose={() => this.setState({ showAuth: false })}
                    authForm={this.state.authForm}
                    authLoading={this.state.authLoading}
                    authError={this.state.authError}
                    authFieldErrors={this.state.authFieldErrors}
                    onInputChange={this.handleAuthInputChange}
                    onSubmit={this.handleAuthSubmit}
                    onRegister={this.switchToRegistration}
                />

                <RegistrationModal
                    show={showRegistrationModal}
                    onClose={this.toggleRegistrationModal}
                    registrationForm={registrationForm}
                    showPassword={showPassword}
                    errors={errors}
                    registrationLoading={this.state.registrationLoading}
                    registrationError={this.state.registrationError}
                    registrationFieldErrors={this.state.registrationFieldErrors}
                    registrationStep={this.state.registrationStep}
                    onInputChange={this.handleRegistrationChange}
                    onNext={this.handleRegistrationNext}
                    onBack={this.handleRegistrationBack}
                    onSubmit={this.handleRegistrationSubmit}
                    onTogglePassword={() => this.setState({ showPassword: !showPassword })}
                />
            </>
        );
    }
}