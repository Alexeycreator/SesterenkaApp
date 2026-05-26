import React from 'react';
import { Link } from 'react-router-dom';

import { UserData } from '../../../service/IndexAuth';

import styles from '../Header.module.css';

interface UserMenuProps {
    user: UserData;
    onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
    return (
        <div className={styles.userMenu}>
            <Link to={`/personalAccount?userId=${user.id}`} className={styles.userMenuItem}>
                👤 Личный кабинет
            </Link>
            <button onClick={onLogout} className={styles.userMenuItem}>
                🚪 Выйти
            </button>
        </div>
    );
};