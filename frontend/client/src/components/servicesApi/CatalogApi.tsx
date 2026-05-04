/* eslint-disable no-throw-literal */
import React from "react";
import axios from "axios";
import { Product } from "./ProductsApi";
import { Categories } from "./CategoriesApi";
import { Manufacturer } from "./ManufacturersApi";
import { StockWarehousesQuantity } from "./StocksApi";

const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: apiUrl || "http://localhost:5027/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Catalog {
    products: Product[];
    categories: Categories[];
    manufacturers: Manufacturer[];
    stocks: StockWarehousesQuantity[];
};

export interface OrderItem {
    quantity: number;
    product_Id: number | null;
    userLogin: string;
}

export const getCatalogData = async (): Promise<Catalog> => {
    try {
        const response = await api.get<Catalog>('/Products/catalog-data');
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

export const addToOrderItem = async (product_Id: number, userLogin: string, quantity: number = 1): Promise<OrderItem> => {
    try {
        const response = await api.post<OrderItem>('/OrderItems', {
            product_Id,
            quantity,
            userLogin
        });
        return response.data;
    }
    catch (error: any) {
        if (error.response) {
            console.error('Ошибка ответа:', error.response.data);
            console.log('Статус:', error.response.status);
            const serverMessage = error.response.data?.message ||
                error.response.data?.title ||
                'Неизвестная ошибка';
            throw {
                ...error,
                serverMessage: serverMessage,
                statusCode: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            throw {
                message: 'Нет ответа от сервера',
                isNetworkError: true
            };
        } else {
            throw {
                message: error.message,
                isSetupError: true
            };
        }
    }
};