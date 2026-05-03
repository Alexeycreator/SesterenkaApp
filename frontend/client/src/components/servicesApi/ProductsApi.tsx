/* eslint-disable no-throw-literal */
import React from "react";
import axios from "axios";
import { Categories } from "./CategoriesApi";
import { Manufacturer } from "./ManufacturersApi";

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
    details?: string | null;
    image: string;
    categories_Id?: number | null;
    manufacturers_Id?: number | null;
};

export interface ControlProductsData {
    products: Product[];
    categories: Categories[];
    manufacturers: Manufacturer[];
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

export const getControlProducts = async (): Promise<ControlProductsData> => {
    try {
        const response = await api.get<ControlProductsData>(`/Products/admin-or-employee-panel-control-products`);
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

export const createProductControlPanel = async (productsData: any): Promise<void> => {
    try {
        await api.post<Product>(`/Products/admin-or-employee-panel-create-product`, productsData);
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

export const updateProductControlPanel = async (productId: number, productsData: any): Promise<void> => {
    try {
        await api.put<Product>(`/Products/admin-or-employee-panel-update-product?productId=${productId}`, productsData);
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

export const deleteProductControlPanel = async (productId: number): Promise<void> => {
    try {
        await api.delete<Product>(`/Products/admin-or-employee-panel-delete-product?productId=${productId}`);
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