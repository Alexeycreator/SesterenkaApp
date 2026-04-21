import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, UserData } from '../service/auth/Index';

interface AuthContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    isAuthenticated: boolean;
    login: (login: string, password: string) => Promise<any>;
    logout: () => void;
    loading: boolean;
    role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(authApi.getStoredUser());
    const [loading, setLoading] = useState(false);

    // Получаем роль из user
    const getUserRole = (): string => {
        return user?.role || 'user';
    };

    useEffect(() => {
        // Слушаем изменения авторизации
        const handleAuthChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ user: UserData | null }>;
            setUser(customEvent.detail.user);
        };

        window.addEventListener('authChange', handleAuthChange);

        // Проверяем валидность токена
        if (user) {
            const isValid = authApi.isAuthenticated();
            if (!isValid) {
                logout();
            }
        }

        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const login = async (login: string, password: string) => {
        setLoading(true);
        try {
            const response = await authApi.login({ login, password });
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user: null } }));
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAuthenticated: !!user,
            login,
            logout,
            loading,
            role: getUserRole()
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};