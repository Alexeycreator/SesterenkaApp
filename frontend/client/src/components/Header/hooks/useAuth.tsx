import { useState, useEffect } from 'react';

import { authApi, UserData } from '../../../service/IndexAuth';

interface UseAuthReturn {
    user: UserData | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (login: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: UserData | null) => void;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Проверка авторизации при загрузке
    useEffect(() => {
        const storedUser = authApi.getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    // Слушатель событий авторизации
    useEffect(() => {
        const handleAuthChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ user: UserData | null }>;
            setUser(customEvent.detail.user);
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const login = async (login: string, password: string) => {
        setLoading(true);
        try {
            const response = await authApi.login({ login, password });
            setUser(response.user);
            // Сохраняем в localStorage
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            // Уведомляем другие компоненты
            window.dispatchEvent(new CustomEvent('authChange', { detail: { user: response.user } }));
        } catch (error) {
            console.error('Ошибка входа:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user: null } }));
    };

    const updateUser = (newUser: UserData | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user: newUser } }));
    };

    return {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateUser,
    };
};