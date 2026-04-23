import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { authApi, UserData } from '../service/auth/Index';

export interface AuthContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    isAuthenticated: boolean;
    login: (login: string, password: string) => Promise<any>;
    logout: () => void;
    loading: boolean;
    role: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(() => {
        const storedUser = authApi.getStoredUser();
        return storedUser;
    });
    const [loading, setLoading] = useState(true);

    const getUserRole = useCallback((): string => {
        return user?.role || 'user';
    }, [user]);

    useEffect(() => {
        const checkAuth = () => {
            const isValid = authApi.isAuthenticated();
            const storedUser = authApi.getStoredUser();

            if (!isValid) {
                logout();
            } else if (storedUser && !user) {
                setUser(storedUser);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

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
            window.dispatchEvent(new CustomEvent('authChange', { detail: { user: response.user } }));
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

    useEffect(() => {
    }, [user]);

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