import React, { Component, useState, useEffect, createRef } from "react";
import { Link } from 'react-router-dom';

import { authApi, UserData } from "../../service/IndexAuth";

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

interface HeaderProps {
    onCurrencyChange?: () => void;
}

interface HeaderState {
    showAuth: boolean;
    showCurrencyMenu: boolean;

    showRegistrationModal: boolean;

    loading: boolean;
    error: string | null;
    user: UserData | null;

    // Форма регистрации
    registrationForm: RegistrationFormData;
    registrationStep: 1 | 2; // Для многошаговой формы
    registrationLoading: boolean;
    registrationError: string | null;
    registrationFieldErrors: Record<string, string>;

    // Форма авторизации
    authForm: {
        login: string;
        password: string;
    };
    authLoading: boolean;
    authError: string | null;
    authFieldErrors: {
        login?: string;
        password?: string;
    };

    showPassword: boolean;
    errors: Record<string, string>;

    showUserMenu: boolean;
}

export default class Header extends Component<HeaderProps, HeaderState> {
    private loginInput = createRef<HTMLInputElement>();
    private passwordInput = createRef<HTMLInputElement>();
    private authRef = createRef<HTMLDivElement>();
    private registrationRef = createRef<HTMLDivElement>();
    private menuRef = React.createRef<HTMLDivElement>();
    private userMenuRef = createRef<HTMLDivElement>();

    // Начальное состояние формы регистрации
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

    // конструктор состояний
    state: HeaderState = {
        showAuth: false,
        showCurrencyMenu: false,
        showRegistrationModal: false,
        user: authApi.getStoredUser(),

        // Регистрация
        registrationForm: { ...this.initialRegistrationForm },
        registrationStep: 1,
        registrationLoading: false,
        registrationError: null,
        registrationFieldErrors: {},

        // Авторизация
        authForm: {
            login: '',
            password: ''
        },
        authLoading: false,
        authError: null,
        authFieldErrors: {},

        showPassword: false,
        loading: true,
        error: null,
        errors: {}, // <-
        showUserMenu: false,
    };

    toggleUserMenu = () => {
        this.setState(prev => ({ showUserMenu: !prev.showUserMenu }));
    };

    closeUserMenu = () => {
        this.setState({ showUserMenu: false });
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    // ========== АВТОРИЗАЦИЯ ==========
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
            authForm: {
                ...prev.authForm,
                [name]: value
            },
            authFieldErrors: {
                ...prev.authFieldErrors,
                [name]: undefined
            },
            authError: null
        }));
    };

    validateAuthForm = (): boolean => {
        const { login, password } = this.state.authForm;
        const errors: { login?: string; password?: string } = {};

        if (!login.trim()) {
            errors.login = 'Введите логин или email';
        }

        if (!password) {
            errors.password = 'Введите пароль';
        }

        this.setState({ authFieldErrors: errors });
        return Object.keys(errors).length === 0;
    };

    notifyAuthChange = (user: UserData | null) => {
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user } }));
    };

    handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!this.validateAuthForm()) {
            return;
        }

        this.setState({ authLoading: true, authError: null });

        try {
            const { login, password } = this.state.authForm;
            const response = await authApi.login({ login, password });

            this.setState({
                user: response.user,
                showAuth: false,
                authForm: { login: '', password: '' },
                authError: null,
                authFieldErrors: {}
            });

            this.notifyAuthChange(response.user);

        } catch (error: any) {
            if (error.response?.status === 401) {
                this.setState({
                    authError: 'Неверный логин или пароль',
                    authFieldErrors: {
                        login: 'Пользователь не найден',
                        password: 'Неверный пароль'
                    }
                });
            } else if (error.request) {
                this.setState({
                    authError: 'Сервер не отвечает. Проверьте подключение'
                });
            } else {
                this.setState({
                    authError: 'Произошла ошибка. Попробуйте снова'
                });
            }
        } finally {
            this.setState({ authLoading: false });
        }
    };

    handleLogout = () => {
        authApi.logout();
        this.setState({ user: null });
        this.notifyAuthChange(null);
    };

    // ========== РЕГИСТРАЦИЯ ==========
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
        if (this.menuRef.current && !this.menuRef.current.contains(event.target as Node)) {
            this.setState({ showCurrencyMenu: false });
        }
        if (this.authRef.current && !this.authRef.current.contains(event.target as Node)) {
            this.setState({
                showAuth: false,
                authError: null,
                authFieldErrors: {},
                authForm: { login: '', password: '' }
            });
        }
        if (this.registrationRef.current && !this.registrationRef.current.contains(event.target as Node)) {
            // Исправляем: передаем объект, а не функцию
            this.setState({
                showRegistrationModal: false,
                registrationError: null,
                registrationFieldErrors: {},
                registrationForm: { ...this.initialRegistrationForm },
                registrationStep: 1
            });
        }
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

    handleRegistrationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!this.validateRegistrationStep2()) {
            return;
        }

        this.setState({ registrationLoading: true, registrationError: null });

        try {
            const form = this.state.registrationForm;

            // Преобразуем данные формы в формат для API
            const registerData = {
                secondName: form.secondName,
                firstName: form.firstName,
                surName: form.surName, // Можно добавить поле в форму если нужно
                phoneNumber: form.phone,
                email: form.email,
                login: form.email, // Используем email как логин
                password: form.password
            };

            // Отправляем запрос на регистрацию
            await authApi.register(registerData);

            // После успешной регистрации пробуем сразу войти
            const loginResponse = await authApi.login({
                login: form.email,
                password: form.password
            });

            this.setState({
                user: loginResponse.user,
                showRegistrationModal: false,
                registrationForm: { ...this.initialRegistrationForm },
                registrationStep: 1
            });

            console.log('Регистрация успешна! Добро пожаловать!');

        } catch (error: any) {
            if (error.response?.status === 409) {
                const message = error.response.data?.message || '';
                if (message.includes('логин')) {
                    this.setState({ registrationError: 'Пользователь с таким email уже существует' });
                } else if (message.includes('телефон')) {
                    this.setState({ registrationError: 'Пользователь с таким телефоном уже существует' });
                } else {
                    this.setState({ registrationError: 'Пользователь уже существует' });
                }
            } else {
                this.setState({ registrationError: 'Ошибка при регистрации. Попробуйте позже' });
            }
        } finally {
            this.setState({ registrationLoading: false });
        }
    };

    toggleRegistrationModal = () => {
        this.setState(prevState => ({
            showRegistrationModal: !prevState.showRegistrationModal,
            showAuth: false // Закрываем модалку входа
        }));
    };

    handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        this.setState(prev => ({
            registrationForm: {
                ...prev.registrationForm,
                [name]: type === 'checkbox' ? checked : value
            }
        }));

        // Очищаем ошибку для поля, если она была
        if (this.state.errors[name]) {
            this.setState(prev => {
                const newErrors = { ...prev.errors };
                delete newErrors[name];
                return { errors: newErrors };
            });
        }
    };

    validateRegistrationForm = (): boolean => {
        const { registrationForm } = this.state;
        const newErrors: Record<string, string> = {};

        // Личные данные
        if (!registrationForm.firstName) newErrors.firstName = 'Имя обязательно';
        if (!registrationForm.secondName) newErrors.lastName = 'Фамилия обязательна';
        if (!registrationForm.email) newErrors.email = 'Email обязателен';
        else if (!/\S+@\S+\.\S+/.test(registrationForm.email)) newErrors.email = 'Email некорректен';

        if (!registrationForm.phone) newErrors.phone = 'Телефон обязателен';

        // Пароль
        if (!registrationForm.password) newErrors.password = 'Пароль обязателен';
        else if (registrationForm.password.length < 6) newErrors.password = 'Пароль должен быть не менее 6 символов';

        if (registrationForm.password !== registrationForm.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        // Согласия
        if (!registrationForm.agreeToPersonalData) {
            newErrors.agreeToPersonalData = 'Необходимо согласие на обработку данных';
        }

        this.setState({ errors: newErrors });
        return Object.keys(newErrors).length === 0;
    };

    render() {
        const {
            showAuth,
            showRegistrationModal,
            registrationForm,
            showPassword,
            errors,
            user,
            authLoading,
            authError,
            authFieldErrors,
            authForm,
            registrationStep,
            registrationLoading,
            registrationError,
            registrationFieldErrors
        } = this.state;

        return (
            <>
                <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
                    <div className={`container-fluid ${styles.container}`}>
                        {/* Логотип */}
                        <Link
                            to="/"
                            className={`navbar-brand ${styles.logo}`}
                        >
                            <span>Колесо и поршень</span>
                        </Link>

                        <button
                            className={`navbar-toggler ${styles.navbarToggler}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent"
                            aria-controls="navbarSupportedContent"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className={`navbar-toggler-icon ${styles.navbarTogglerIcon}`}></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className={`navbar-nav me-auto mb-2 mb-lg-0 ${styles.navMenu}`}>
                                <li className="nav-item">
                                    <Link
                                        to="/catalog"
                                        className={`nav-link ${styles.navLink}`}
                                    >
                                        Каталог
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        to="/news"
                                        className={`nav-link ${styles.navLink}`}
                                    >
                                        Новости
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${styles.navLink}`}
                                        to="/information"
                                    >
                                        Информация
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${styles.navLink}`}
                                        to="/help"
                                    >
                                        Помощь
                                    </Link>
                                </li>
                                <li className="nav-item">
                                        <Link
                                            className={`nav-link ${styles.navLink}`}
                                            to={`/basket`}
                                        >
                                            Корзина
                                        </Link>
                                    </li>
                            </ul>

                            {user && (
                                <ul className={`navbar-nav me-auto mb-2 mb-lg-0 ${styles.navList}`}>
                                    <li>
                                        <Link
                                            className={`dropdown-item ${styles.navLink}`}
                                            to={`/lk/${user.id}`}
                                        >
                                            Личный кабинет
                                        </Link>
                                    </li>
                                </ul>
                            )}

                            {/* Кнопка авторизации */}
                            <div className={styles.positionRelative}>
                                {user ? (
                                    <div className={styles.userInfo}>
                                        <span className={styles.userName}>
                                            {user.secondName} {user.firstName}
                                        </span>
                                        <button
                                            className={styles.logoutButton}
                                            onClick={this.handleLogout}
                                        >
                                            Выйти
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.authButton}
                                        id="authButton"
                                        onClick={this.toggleAuthModal}
                                    >
                                        𓁐
                                    </button>
                                )}

                                {/* Модальное окно авторизации */}
                                {showAuth && !user && (
                                    <div
                                        ref={this.authRef}
                                        id="authModal"
                                        className={styles.authModal}
                                    >
                                        <h3 className={styles.authModalTitle}>
                                            𓋴 Вход
                                        </h3>

                                        <form onSubmit={this.handleAuthSubmit}>
                                            <div className={styles.authFormField}>
                                                <input
                                                    type="text"
                                                    name="login"
                                                    value={this.state.authForm.login}
                                                    onChange={this.handleAuthInputChange}
                                                    placeholder="Введите логин или Email"
                                                    className={`${styles.authInput} ${this.state.authFieldErrors.login ? styles.authInputError : ''
                                                        }`}
                                                />
                                                {this.state.authFieldErrors.login && (
                                                    <div className={styles.authFieldError}>
                                                        {this.state.authFieldErrors.login}
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.authFormField}>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={this.state.authForm.password}
                                                    onChange={this.handleAuthInputChange}
                                                    placeholder="Пароль"
                                                    className={`${styles.authInput} ${this.state.authFieldErrors.password ? styles.authInputError : ''
                                                        }`}
                                                />
                                                {this.state.authFieldErrors.password && (
                                                    <div className={styles.authFieldError}>
                                                        {this.state.authFieldErrors.password}
                                                    </div>
                                                )}
                                            </div>

                                            {this.state.authError && (
                                                <div className={styles.authError}>
                                                    {this.state.authError}
                                                </div>
                                            )}

                                            <div className={styles.authButtons}>
                                                <button
                                                    type="submit"
                                                    disabled={this.state.authLoading}
                                                    className={styles.authSubmitButton}
                                                >
                                                    {this.state.authLoading ? 'Вход...' : 'Войти'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={this.switchToRegistration}
                                                    className={styles.authRegisterButton}
                                                >
                                                    Регистрация
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Модальное окно регистрации */}
                {showRegistrationModal && (
                    <div className={styles.registrationOverlay}>
                        <div className={styles.registrationModal}>
                            <button
                                onClick={this.toggleRegistrationModal}
                                className={styles.closeButton}
                            >
                                ✕
                            </button>

                            <h2 className={styles.registrationTitle}>
                                🐪 Регистрация туриста
                            </h2>

                            <form onSubmit={this.handleRegistrationSubmit}>
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        📋 Личные данные
                                    </h3>

                                    <div className={styles.formGrid}>
                                        <div className={styles.formField}>
                                            <label className={styles.formLabel}>
                                                Имя <span className={styles.required}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={registrationForm.firstName}
                                                onChange={this.handleRegistrationChange}
                                                placeholder="Иван"
                                                className={`${styles.formInput} ${errors.firstName ? styles.formInputError : ''
                                                    }`}
                                            />
                                            {errors.firstName && (
                                                <div className={styles.fieldError}>{errors.firstName}</div>
                                            )}
                                        </div>

                                        <div className={styles.formField}>
                                            <label className={styles.formLabel}>
                                                Фамилия <span className={styles.required}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={registrationForm.secondName}
                                                onChange={this.handleRegistrationChange}
                                                placeholder="Петров"
                                                className={`${styles.formInput} ${errors.lastName ? styles.formInputError : ''
                                                    }`}
                                            />
                                            {errors.lastName && (
                                                <div className={styles.fieldError}>{errors.lastName}</div>
                                            )}
                                        </div>

                                        <div className={styles.formField}>
                                            <label className={styles.formLabel}>
                                                Email <span className={styles.required}>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={registrationForm.email}
                                                onChange={this.handleRegistrationChange}
                                                placeholder="ivan@mail.ru"
                                                className={`${styles.formInput} ${errors.email ? styles.formInputError : ''
                                                    }`}
                                            />
                                            {errors.email && (
                                                <div className={styles.fieldError}>{errors.email}</div>
                                            )}
                                        </div>

                                        <div className={styles.formField}>
                                            <label className={styles.formLabel}>
                                                Телефон <span className={styles.required}>*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={registrationForm.phone}
                                                onChange={this.handleRegistrationChange}
                                                placeholder="+7 (999) 123-45-67"
                                                className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''
                                                    }`}
                                            />
                                            {errors.phone && (
                                                <div className={styles.fieldError}>{errors.phone}</div>
                                            )}
                                        </div>

                                        <div className={styles.formField}>
                                            <label className={styles.formLabel}>
                                                Пол
                                            </label>
                                            <div className={styles.radioGroup}>
                                                <label className={styles.radioLabel}>
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="male"
                                                        checked={registrationForm.gender === 'Мужской'}
                                                        onChange={this.handleRegistrationChange}
                                                    />
                                                    Мужской
                                                </label>
                                                <label className={styles.radioLabel}>
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="female"
                                                        checked={registrationForm.gender === 'Женский'}
                                                        onChange={this.handleRegistrationChange}
                                                    />
                                                    Женский
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        🔐 Безопасность
                                    </h3>

                                    <div className={styles.formGrid}>
                                        <div className={styles.formField}>
                                            <label className={styles.formLabel}>
                                                Пароль <span className={styles.required}>*</span>
                                            </label>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={registrationForm.password}
                                                onChange={this.handleRegistrationChange}
                                                placeholder="Не менее 6 символов"
                                                className={`${styles.formInput} ${errors.password ? styles.formInputError : ''
                                                    }`}
                                            />
                                            {errors.password && (
                                                <div className={styles.fieldError}>{errors.password}</div>
                                            )}
                                        </div>

                                        <div className={styles.formField}>
                                            <label className={styles.formLabel}>
                                                Подтвердите пароль <span className={styles.required}>*</span>
                                            </label>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={registrationForm.confirmPassword}
                                                onChange={this.handleRegistrationChange}
                                                placeholder="Повторите пароль"
                                                className={`${styles.formInput} ${errors.confirmPassword ? styles.formInputError : ''
                                                    }`}
                                            />
                                            {errors.confirmPassword && (
                                                <div className={styles.fieldError}>{errors.confirmPassword}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.showPasswordCheckbox}>
                                        <label className={styles.showPasswordLabel}>
                                            <input
                                                type="checkbox"
                                                checked={showPassword}
                                                onChange={() => this.setState({ showPassword: !showPassword })}
                                            />
                                            Показать пароль
                                        </label>
                                    </div>
                                </section>

                                <div className={styles.registrationButtons}>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                    >
                                        🐪 Зарегистрироваться
                                    </button>

                                    <button
                                        type="button"
                                        onClick={this.toggleRegistrationModal}
                                        className={styles.cancelButton}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </>
        );
    }
}  
