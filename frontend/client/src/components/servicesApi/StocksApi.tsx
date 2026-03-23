import React from "react";
import axios from "axios";

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

export const getStockWarehousesQuantity = async (): Promise<StockWarehousesQuantity[]> => {
    try {
        const response = await api.get<StockWarehousesQuantity[]>('/Products/stock-warehouses');
        return response.data;
    }
    catch (error: any) {
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