/* eslint-disable no-throw-literal */
import React from "react";
import axios from "axios";
import { Warehouses } from "./WarehousesApi";

const apiUrl = process.env.REACT_APP_API_URL;


const api = axios.create({
    baseURL: apiUrl || "http://localhost:5027/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Stock {
    id: number;
    quantity: number;
    products_Id: number | null;
    warehouses_Id: number | null;
};

export interface WarehouseStock {
    warehouseId: number;
    warehouseName: string | null;
    warehouseAddress: string | null;
    quantity: number;
};

export interface StockWarehousesQuantity {
    productId: number;
    warehouses: WarehouseStock[];
    totalQuantity: number;
};

export interface ProductsManagementStock {
    id: number;
    nameProduct: string;
    partNumber: string;
};

export interface StockManagementDto {
    products: ProductsManagementStock[] | null;
    stocks: Stock[] | null;
    warehouses: Warehouses[] | null;
};

export const getStocks = async (): Promise<Stock[]> => {
    const response = await api.get<Stock[]>('/Stocks');
    return response.data;
};

export const getStockById = async (id: number): Promise<Stock> => {
    try {
        const response = await api.get<Stock>(`/Stocks/${id}`);
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

export const getStockWarehousesQuantity = async (): Promise<StockWarehousesQuantity[]> => {
    try {
        const response = await api.get<StockWarehousesQuantity[]>('/Products/stock-warehouses');
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

export const getManagementStocks = async (): Promise<StockManagementDto> => {
    try {
        const response = await api.get<StockManagementDto>('/Stocks/management-stocks');
        // Так как сервер возвращает массив, берем первый элемент
        const data = Array.isArray(response.data) && response.data.length > 0
            ? response.data[0]
            : response.data;
        return data;
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