import React from 'react';

import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinnerWrapper}>
                <div className={styles.spinner}>
                    <div className={styles.spinnerIcon}>⚙️</div>
                </div>
                <h2 className={styles.loadingTitle}>Загрузка</h2>
                <p className={styles.loadingText}>
                    Пожалуйста, подождите 5-15 секунд...
                </p>
                <p className={styles.loadingSubtext}>
                    Загружаем информацию о товарах
                </p>
            </div>
        </div>
    );
};

export default LoadingSpinner;