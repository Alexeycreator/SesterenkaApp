import api from '../core/Axios.config';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserData } from './Types';

export const authApi = {
    // Вход в систему - POST /api/Clients/login
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/Users/login', data);
        
        // Сохраняем токен и данные пользователя
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('tokenExpiry', response.data.expiry);
        }
        
        return response.data;
    },

    // Регистрация - POST /api/Clients/register
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await api.post<RegisterResponse>('/Users/register', data);
        return response.data;
    },

    // Получение текущего пользователя - GET /api/Clients/me
    getCurrentUser: async (): Promise<UserData> => {
        const response = await api.get<UserData>('/Users/me');
        return response.data;
    },

    // Выход из системы (только на клиенте)
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
    },

    // Проверка авторизации
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');
        const expiry = localStorage.getItem('tokenExpiry');
        
        if (!token || !expiry) return false;
        
        // Проверяем, не истек ли токен
        return new Date(expiry) > new Date();
    },

    // Получение сохраненного пользователя
    getStoredUser: (): UserData | null => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
};