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

export interface OrderItemDto {
    id: number;
    quantity: number;
    priceAtMoment: number;
    nameCategories: string;
    nameManufacturers: string;
    nameProducts: string;
    partNumber: string;
    imageProduct: string;
    totalPrice: number;
}

export interface OrderItem {
    items: OrderItemDto[];
    totalQuantity: number;
    totalAmount: number;
};

// получение данных для корзины
export const getOrderItemData = async (): Promise<OrderItem> => {
    try {
        const response = await api.get<OrderItem>('/OrderItems/orderItem-data');
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

// обновление количества позиций в корзине
export const updateOrderItemQuantity = async (productId: number, quantity: number): Promise<OrderItem> => {
    try {
        const response = await api.put<OrderItem>(`/OrderItems/product/${productId}`, { quantity });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.log('Ошибка ответа:', error.response.data);
            console.log('Статус:', error.response.status);

            const serverMessage = error.response.data?.message ||
                error.response.data?.title ||
                'Неизвестная ошибка';

            // eslint-disable-next-line no-throw-literal
            throw {
                ...error,
                serverMessage: serverMessage,
                statusCode: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            // eslint-disable-next-line no-throw-literal
            throw {
                message: 'Нет ответа от сервера',
                isNetworkError: true
            };
        } else {
            // eslint-disable-next-line no-throw-literal
            throw {
                message: error.message,
                isSetupError: true
            };
        }
    }
};

export const deleteOrderItem = async (id: number): Promise<void> => {
    try {
        await api.delete(`/OrderItems/${id}`);
    }
    catch (error: any) {
        if (error.response) {
            // Сервер ответил с ошибкой (4xx, 5xx)
            console.error('Ошибка ответа:', error.response.data);
            console.log('Статус:', error.response.status);

            // Извлекаем сообщение от сервера
            const serverMessage = error.response.data?.message ||
                error.response.data?.title ||
                'Неизвестная ошибка';

            // eslint-disable-next-line no-throw-literal
            throw {
                ...error,
                serverMessage: serverMessage,
                statusCode: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            // Запрос был отправлен, но нет ответа
            // eslint-disable-next-line no-throw-literal
            throw {
                message: 'Нет ответа от сервера',
                isNetworkError: true
            };
        } else {
            // Ошибка при настройке запроса
            // eslint-disable-next-line no-throw-literal
            throw {
                message: error.message,
                isSetupError: true
            };
        }
    }
};