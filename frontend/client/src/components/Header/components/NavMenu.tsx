import React from 'react';
import { Link } from 'react-router-dom';

import styles from '../Header.module.css';

export const NavMenu: React.FC = () => {
    return (
        <ul className={`navbar-nav me-auto mb-2 mb-lg-0 ${styles.navMenu}`}>
            <li className="nav-item">
                <Link to="/catalog" className={`nav-link ${styles.navLink}`}>Каталог</Link>
            </li>
            <li className="nav-item">
                <Link to="/news" className={`nav-link ${styles.navLink}`}>Новости</Link>
            </li>
            <li className="nav-item">
                <Link to="/information" className={`nav-link ${styles.navLink}`}>Информация</Link>
            </li>
            <li className="nav-item">
                <Link to="/help" className={`nav-link ${styles.navLink}`}>Помощь</Link>
            </li>
        </ul>
    );
};