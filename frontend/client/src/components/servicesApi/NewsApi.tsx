/* eslint-disable no-throw-literal */
import React from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: apiUrl || "http://localhost:5027/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface News {
    id: number;
    body: string;
    date: Date;
    image?: string | null;
    theme: string;
    type: string;
};

export const getAllNews = async (): Promise<News[]> => {
    try {
        const response = await api.get<News[]>(`/News/get-all-news`);
        return response.data;
    }
    catch (error: any) {
        if (error.response) {
            console.log('Ошибка ответа:', error.response.data);
            console.log('Статус:', error.response.status);

            throw {
                ...error,
                serverMessage: error.response.data?.message || 'Неизвестная ошибка',
                statusCode: error.response.status
            };
        } else if (error.request) {
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        } else {
            throw { message: error.message, isSetupError: true };
        }
    }
};