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

export const getOrderItemData = async (): Promise<OrderItem> => {
    try {
        const response = await api.get<OrderItem>('/OrderItems/basket-data');
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

// export const getOrderItemById = async (id: number): Promise<OrderItem> => {
//     try {
//         const response = await api.get<OrderItem>(`/OrderItems/${id}`);
//         return response.data;
//     } catch (error: any) {
//         if (error.response) {
//             console.log('Ошибка ответа:', error.response.data);
//             console.log('Статус:', error.response.status);

//             // eslint-disable-next-line no-throw-literal
//             throw {
//                 ...error,
//                 serverMessage: error.response.data?.message || 'Неизвестная ошибка',
//                 statusCode: error.response.status
//             };
//         } else if (error.request) {
//             // eslint-disable-next-line no-throw-literal
//             throw { message: 'Нет ответа от сервера', isNetworkError: true };
//         } else {
//             // eslint-disable-next-line no-throw-literal
//             throw { message: error.message, isSetupError: true };
//         }
//     }
// };