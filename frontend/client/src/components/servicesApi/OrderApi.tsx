import React from "react";
import axios from "axios";
import { AddressOrder } from "./AddressesApi";

const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: apiUrl || "http://localhost:5027/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Order {
    id: number;
    orderDate: Date;
    status: string;
    user_Id?: number | null;
};

export interface OrderItems {
    id: number,
    quntity: number,
    price: number,
    totalPrice: number,
    nameProduct: string
};

export interface Orders {
    id: number,
    nameOrder: string;
    loginUser: string,
    status: string,
    orderDate: Date,
    orderItems: OrderItems[]
};

export interface OrderData {
    orders: Orders[],
    addresses: AddressOrder[],
    countOrder: number,
    totalPrice: number
};

export interface OrderItemsOrderDataDto {
    id: number,
    quantity: number,
    price: number,
    nameProduct: string
};

export interface AddOrder {
    userLogin: string,
    addressId: number,
    orderItems: OrderItemsOrderDataDto[]
};

export interface ProductsCurrentOrder{
    id: number;
    quantity: number;
    price: number;
    nameProduct: string;
    categories: string;
    manufacturers: string;
    partNumber: string;
    totalPriceProduct: number;
    image: string;
}

export interface CurrentOrder {
    id: number;
    dateOrder: Date;
    status: string;
    countProducts: number;
    address: AddressOrder;
    products: ProductsCurrentOrder[];
    totalPriceOrder: number;
}

// получение данных всех заказов
export const getOrderData = async (): Promise<Order[]> => {
    try {
        const response = await api.get<Order[]>('/Orders');
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

// получение заказов пользователя
export const getOrderUser = async (loginUser: string): Promise<OrderData[]> => {
    try {
        const response = await api.get<OrderData[]>(`Orders/order-data?currentUserLogin=${loginUser}`);
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

// обновление состояния заказа
export const createOrder = async (orderData: AddOrder): Promise<AddOrder> => {
    try {
        const response = await api.post<AddOrder>('/Orders/create-order', orderData);
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

// вывод информации о конкретной заказе
export const getCurrentOrderData = async(orderId: number):Promise<CurrentOrder>=>{
try {
        const response = await api.get<CurrentOrder>(`Orders/current-order?id=${orderId}`);
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