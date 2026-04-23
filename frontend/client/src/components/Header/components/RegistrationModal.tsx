import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import styles from './RegistrationModal.module.css';

interface RegistrationModalProps {
    show: boolean;
    onClose: () => void;
    registrationForm: any;
    showPassword: boolean;
    errors: Record<string, string>;
    registrationLoading: boolean;
    registrationError: string | null;
    registrationFieldErrors: Record<string, string>;
    registrationStep: 1 | 2;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onNext: () => void;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onTogglePassword: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
    show,
    onClose,
    registrationForm,
    showPassword,
    registrationLoading,
    registrationError,
    registrationFieldErrors,
    registrationStep,
    onInputChange,
    onBack,
    onSubmit,
    onTogglePassword,
    onNext
}) => {
    const handleNext = () => {
        onNext();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg" className={styles.modal}>
            <Modal.Header closeButton className={styles.modalHeader}>
                <Modal.Title className={styles.modalTitle}>
                    <span className={styles.titleIcon}>📝</span>
                    {registrationStep === 1 ? 'Регистрация - Шаг 1' : 'Регистрация - Шаг 2'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
                {registrationError && (
                    <div className={styles.errorMessage}>
                        {registrationError}
                    </div>
                )}

                {registrationStep === 1 ? (
                    // Шаг 1: Личная информация
                    <div className={styles.formContainer}>
                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>👤</span>
                                Фамилия <span className={styles.requiredStar}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="secondName"
                                value={registrationForm.secondName}
                                onChange={onInputChange}
                                isInvalid={!!registrationFieldErrors.secondName}
                                placeholder="Введите вашу фамилию"
                                className={styles.formInput}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className={styles.errorFeedback}>
                                {registrationFieldErrors.secondName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>👤</span>
                                Имя <span className={styles.requiredStar}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={registrationForm.firstName}
                                onChange={onInputChange}
                                isInvalid={!!registrationFieldErrors.firstName}
                                placeholder="Введите ваше имя"
                                className={styles.formInput}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className={styles.errorFeedback}>
                                {registrationFieldErrors.firstName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>👤</span>
                                Отчество
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="surName"
                                value={registrationForm.surName || ''}
                                onChange={onInputChange}
                                isInvalid={!!registrationFieldErrors.surName}
                                placeholder="Введите ваше отчество"
                                className={styles.formInput}
                            />
                            <Form.Control.Feedback type="invalid" className={styles.errorFeedback}>
                                {registrationFieldErrors.surName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>📧</span>
                                Email <span className={styles.requiredStar}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={registrationForm.email}
                                onChange={onInputChange}
                                isInvalid={!!registrationFieldErrors.email}
                                placeholder="example@mail.ru"
                                className={styles.formInput}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className={styles.errorFeedback}>
                                {registrationFieldErrors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>📱</span>
                                Телефон <span className={styles.requiredStar}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={registrationForm.phone}
                                onChange={onInputChange}
                                isInvalid={!!registrationFieldErrors.phone}
                                placeholder="+7XXXXXXXXXX"
                                className={styles.formInput}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className={styles.errorFeedback}>
                                {registrationFieldErrors.phone}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>⚥</span>
                                Пол <span className={styles.requiredStar}>*</span>
                            </Form.Label>
                            <div className={styles.genderGroup}>
                                <label className={styles.genderLabel}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Мужской"
                                        checked={registrationForm.gender === 'Мужской'}
                                        onChange={onInputChange}
                                        className={styles.genderRadio}
                                    />
                                    <span className={styles.genderText}>Мужской</span>
                                </label>
                                <label className={styles.genderLabel}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Женский"
                                        checked={registrationForm.gender === 'Женский'}
                                        onChange={onInputChange}
                                        className={styles.genderRadio}
                                    />
                                    <span className={styles.genderText}>Женский</span>
                                </label>
                            </div>
                            {registrationFieldErrors.gender && (
                                <div className={styles.errorFeedback}>{registrationFieldErrors.gender}</div>
                            )}
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>🎂</span>
                                Дата рождения <span className={styles.requiredStar}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="date"
                                name="birthDay"
                                value={registrationForm.birthDay}
                                onChange={onInputChange}
                                isInvalid={!!registrationFieldErrors.birthDay}
                                className={styles.formInput}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className={styles.errorFeedback}>
                                {registrationFieldErrors.birthDay}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </div>
                ) : (
                    // Шаг 2: Пароль и соглашения
                    <Form onSubmit={handleSubmit} className={styles.formContainer}>
                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>🔒</span>
                                Пароль <span className={styles.requiredStar}>*</span>
                            </Form.Label>
                            <div className={styles.passwordWrapper}>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={registrationForm.password}
                                    onChange={onInputChange}
                                    isInvalid={!!registrationFieldErrors.password}
                                    placeholder="Минимум 6 символов"
                                    className={styles.formInput}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={onTogglePassword}
                                    className={styles.passwordToggle}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </Button>
                            </div>
                            <Form.Control.Feedback type="invalid" className={styles.errorFeedback}>
                                {registrationFieldErrors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>🔒</span>
                                Подтверждение пароля <span className={styles.requiredStar}>*</span>
                            </Form.Label>
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={registrationForm.confirmPassword}
                                onChange={onInputChange}
                                isInvalid={!!registrationFieldErrors.confirmPassword}
                                placeholder="Повторите пароль"
                                className={styles.formInput}
                                required
                            />
                            <Form.Control.Feedback type="invalid" className={styles.errorFeedback}>
                                {registrationFieldErrors.confirmPassword}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className={styles.checkboxGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="agreeToPersonalData"
                                    checked={registrationForm.agreeToPersonalData}
                                    onChange={onInputChange}
                                    className={styles.checkbox}
                                />
                                <span className={styles.checkboxText}>
                                    Я согласен на обработку персональных данных <span className={styles.requiredStar}>*</span>
                                </span>
                            </label>
                            {registrationFieldErrors.agreeToPersonalData && (
                                <div className={styles.errorFeedback}>{registrationFieldErrors.agreeToPersonalData}</div>
                            )}
                        </Form.Group>

                        <Button
                            type="submit"
                            className={styles.submitButton}
                            disabled={registrationLoading}
                        >
                            {registrationLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Загрузка...
                                </>
                            ) : (
                                'Зарегистрироваться'
                            )}
                        </Button>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer className={styles.modalFooter}>
                {registrationStep === 2 && (
                    <Button variant="outline-secondary" onClick={onBack} className={styles.backButton}>
                        ← Назад
                    </Button>
                )}
                {registrationStep === 1 && (
                    <Button
                        onClick={handleNext}
                        disabled={registrationLoading}
                        className={styles.nextButton}
                    >
                        Далее →
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default RegistrationModal;