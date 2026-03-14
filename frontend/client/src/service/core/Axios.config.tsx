import axios from 'axios';

const API_URL = "http://localhost:5027/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Перехватчик запросов - добавляет JWT токен к каждому запросу
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 JWT токен добавлен к запросу:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Перехватчик ответов - обрабатывает ошибки авторизации
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если ошибка 401 (Unauthorized) и это не повторный запрос
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Можно добавить логику обновления токена здесь
            // Например, если есть refresh token

            // Если обновить не получилось - очищаем данные и перенаправляем на логин
            console.log('❌ Токен истек или недействителен');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            
            // Перенаправление на страницу логина (если нужно)
            // window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;