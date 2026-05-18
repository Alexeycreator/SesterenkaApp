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

export interface Manufacturer {
    id: number;
    name: string;
};

export const getManufacturers = async (): Promise<Manufacturer[]> => {
    try {
        const response = await api.get<Manufacturer[]>('/Manufacturers');
        return response.data;
    } catch (error: any) {
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

export const getManufacturerById = async (id: number): Promise<Manufacturer> => {
    try {
        const response = await api.get<Manufacturer>(`/Manufacturers/${id}`);
        return response.data;
    } catch (error: any) {
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

export const createManufacturer = async (manufacturerData: { name: string }, userId: number): Promise<void> => {
    try {
        await api.post<Manufacturer>(`/Manufacturers/create-manufacturer?userId=${userId}`, manufacturerData);
    } catch (error: any) {
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

export const updateManufacturer = async (manufacturerId: number, manufacturerData: { name: string }, userId: number): Promise<void> => {
    try {
        await api.put<Manufacturer>(`/Manufacturers/update-manufacturer?manufacturerId=${manufacturerId}&userId=${userId}`, manufacturerData);
    } catch (error: any) {
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

export const deleteManufacturer = async (manufacturerId: number, userId: number): Promise<void> => {
    try {
        await api.delete<Manufacturer>(`/Manufacturers/delete-manufacturer?manufacturerId=${manufacturerId}&userId=${userId}`);
    } catch (error: any) {
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