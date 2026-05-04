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

export interface OrderItemDto {
    id: number;
    productId: number;
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
export const getOrderItemData = async (loginUser: string, roleUser: string): Promise<OrderItem> => {
    try {
        const response = await api.post<OrderItem>('/OrderItems/orderItem-data', {
            loginUser,
            roleUser
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Ошибка ответа:', error.response.data);
                console.log('Статус:', error.response.status);
            }
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

export const deleteOrderItem = async (orderId: number, productId: number, userId: number): Promise<void> => {
    try {
        await api.delete(`/OrderItems/delete-product-in-order-items?orderId=${orderId}&productId=${productId}&userId=${userId}`);
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

export const getNumberOrder = async (userId: number): Promise<number> => {
    try {
        const response = await api.get<number>(`OrderItems/get-number-order?userId=${userId}`);
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