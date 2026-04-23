import React from 'react';

import styles from '../Header.module.css';

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

interface RegistrationModalProps {
    show: boolean;
    onClose: () => void;
    registrationForm: RegistrationFormData;
    showPassword: boolean;
    errors: Record<string, string>;
    registrationLoading: boolean;
    registrationError: string | null;
    registrationFieldErrors: Record<string, string>;
    registrationStep: 1 | 2;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onNext: () => void;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onTogglePassword: () => void;
}

export const RegistrationModal = React.forwardRef<HTMLDivElement, RegistrationModalProps>(({
    show,
    onClose,
    registrationForm,
    showPassword,
    errors,
    registrationLoading,
    registrationError,
    registrationFieldErrors,
    registrationStep,
    onInputChange,
    onNext,
    onBack,
    onSubmit,
    onTogglePassword
}, ref) => {
    if (!show) return null;

    return (
        <div className={styles.registrationOverlay}>
            <div ref={ref} className={styles.registrationModal}>
                <button
                    onClick={onClose}
                    className={styles.closeButton}
                >
                    ✕
                </button>

                <h2 className={styles.registrationTitle}>
                    🐪 Регистрация туриста
                </h2>

                <form onSubmit={onSubmit}>
                    {registrationStep === 1 ? (
                        // Шаг 1: Личные данные
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
                                        onChange={onInputChange}
                                        placeholder="Иван"
                                        className={`${styles.formInput} ${errors.firstName ? styles.formInputError : ''}`}
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
                                        name="secondName"
                                        value={registrationForm.secondName}
                                        onChange={onInputChange}
                                        placeholder="Петров"
                                        className={`${styles.formInput} ${errors.secondName ? styles.formInputError : ''}`}
                                    />
                                    {errors.secondName && (
                                        <div className={styles.fieldError}>{errors.secondName}</div>
                                    )}
                                </div>

                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>
                                        Отчество
                                    </label>
                                    <input
                                        type="text"
                                        name="surName"
                                        value={registrationForm.surName || ''}
                                        onChange={onInputChange}
                                        placeholder="Иванович"
                                        className={styles.formInput}
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>
                                        Email <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={registrationForm.email}
                                        onChange={onInputChange}
                                        placeholder="ivan@mail.ru"
                                        className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
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
                                        onChange={onInputChange}
                                        placeholder="+7 (999) 123-45-67"
                                        className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
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
                                                onChange={onInputChange}
                                            />
                                            Мужской
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={registrationForm.gender === 'Женский'}
                                                onChange={onInputChange}
                                            />
                                            Женский
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>
                                        Дата рождения
                                    </label>
                                    <input
                                        type="date"
                                        name="birthDay"
                                        value={registrationForm.birthDay}
                                        onChange={onInputChange}
                                        className={styles.formInput}
                                    />
                                </div>
                            </div>

                            {registrationError && (
                                <div className={styles.registrationError}>
                                    {registrationError}
                                </div>
                            )}

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={styles.cancelButton}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    onClick={onNext}
                                    className={styles.nextButton}
                                >
                                    Далее →
                                </button>
                            </div>
                        </section>
                    ) : (
                        // Шаг 2: Безопасность
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
                                        onChange={onInputChange}
                                        placeholder="Не менее 6 символов"
                                        className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
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
                                        onChange={onInputChange}
                                        placeholder="Повторите пароль"
                                        className={`${styles.formInput} ${errors.confirmPassword ? styles.formInputError : ''}`}
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
                                        onChange={onTogglePassword}
                                    />
                                    Показать пароль
                                </label>
                            </div>

                            <div className={styles.agreementCheckbox}>
                                <label className={styles.agreementLabel}>
                                    <input
                                        type="checkbox"
                                        name="agreeToPersonalData"
                                        checked={registrationForm.agreeToPersonalData}
                                        onChange={onInputChange}
                                    />
                                    Я согласен на обработку персональных данных
                                </label>
                                {errors.agreeToPersonalData && (
                                    <div className={styles.fieldError}>{errors.agreeToPersonalData}</div>
                                )}
                            </div>

                            {registrationError && (
                                <div className={styles.registrationError}>
                                    {registrationError}
                                </div>
                            )}

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className={styles.backButton}
                                >
                                    ← Назад
                                </button>
                                <button
                                    type="submit"
                                    disabled={registrationLoading}
                                    className={styles.submitButton}
                                >
                                    {registrationLoading ? 'Регистрация...' : '🐪 Зарегистрироваться'}
                                </button>
                            </div>
                        </section>
                    )}
                </form>
            </div>
        </div>
    );
});

RegistrationModal.displayName = 'RegistrationModal';