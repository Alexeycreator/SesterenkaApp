import React from 'react';

import styles from '../Header.module.css';

interface AuthModalProps {
    show: boolean;
    onClose: () => void;
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
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onRegister: () => void;
}

export const AuthModal = React.forwardRef<HTMLDivElement, AuthModalProps>(({
    show,
    onClose,
    authForm,
    authLoading,
    authError,
    authFieldErrors,
    onInputChange,
    onSubmit,
    onRegister
}, ref) => {
    if (!show) return null;

    return (
        <div ref={ref} className={styles.authModal}>
            <h3 className={styles.authModalTitle}>
                Авторизация
            </h3>

            <form onSubmit={onSubmit}>
                <div className={styles.authFormField}>
                    <input
                        type="text"
                        name="login"
                        value={authForm.login}
                        onChange={onInputChange}
                        placeholder="Введите логин, телефон или Email"
                        className={`${styles.authInput} ${authFieldErrors.login ? styles.authInputError : ''}`}
                    />
                    {authFieldErrors.login && (
                        <div className={styles.authFieldError}>
                            {authFieldErrors.login}
                        </div>
                    )}
                </div>

                <div className={styles.authFormField}>
                    <input
                        type="password"
                        name="password"
                        value={authForm.password}
                        onChange={onInputChange}
                        placeholder="Введите пароль"
                        className={`${styles.authInput} ${authFieldErrors.password ? styles.authInputError : ''}`}
                    />
                    {authFieldErrors.password && (
                        <div className={styles.authFieldError}>
                            {authFieldErrors.password}
                        </div>
                    )}
                </div>

                {authError && (
                    <div className={styles.authError}>
                        {authError}
                    </div>
                )}

                <div className={styles.authButtons}>
                    <button
                        type="submit"
                        disabled={authLoading}
                        className={styles.authSubmitButton}
                    >
                        {authLoading ? 'Вход...' : 'Войти'}
                    </button>

                    <button
                        type="button"
                        onClick={onRegister}
                        className={styles.authRegisterButton}
                    >
                        Регистрация
                    </button>
                </div>
            </form>
        </div>
    );
});

AuthModal.displayName = 'AuthModal';