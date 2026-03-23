import React from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;


const api = axios.create({
    baseURL: apiUrl || "http://localhost:5027/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Product {
    id: number;
    name: string;
    partNumber: string;
    price: number;
    details: string;
    image: string;
    categories_Id?: number | null;
    manufacturers_Id?: number | null;
};

export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/Products');
    return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
    try {
        const response = await api.get<Product>(`/Products/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.log('Ошибка ответа:', error.response.data);
            console.log('Статус:', error.response.status);

            // eslint-disable-next-line no-throw-literal
            throw {
                ...error,
                serverMessage: error.response.data?.message || 'Неизвестная ошибка',
                statusCode: error.response.status
            };
        } else if (error.request) {
            // eslint-disable-next-line no-throw-literal
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        } else {
            // eslint-disable-next-line no-throw-literal
            throw { message: error.message, isSetupError: true };
        }
    }
};