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

export interface TermsOfUse {
    id: number;
    title: string;
    icon: string;
    content: string;
    date: string;
};

export const getAllTermsOfUse = async (): Promise<TermsOfUse[]> => {
    try {
        const response = await api.get<TermsOfUse[]>(`/TermsOfUse/get-all-terms-of-use`);
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

export const createTermsOfUse = async (userId: number, request: TermsOfUse): Promise<void> => {
    try {
        await api.post(`/TermsOfUse/create-terms-of-use?userId=${userId}`, request);
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

export const updateTermsOfUse = async (userId: number, request: TermsOfUse): Promise<void> => {
    try {
        await api.put(`/TermsOfUse/update-terms-of-use?userId=${userId}`, request);
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

export const deleteTermsOfUseById = async (userId: number, termsOfUseId: number): Promise<void> => {
    try {
        await api.delete(`/TermsOfUse/delete-terms-of-use?userId=${userId}&termsOfUseId=${termsOfUseId}`);
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