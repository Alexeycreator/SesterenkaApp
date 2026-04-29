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

export interface Address {
    id: number;
    region: string;
    city: string;
    street: string;
    house?: number | null;
    isShop: boolean;
};

export interface AddressOrder {
    id: number,
    city: string,
    street: string,
    house?: string | null
};

export const getAddresses = async (): Promise<Address[]> => {
    try {
        const response = await api.get<Address[]>('/Addresses');
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

export const getShopAddress = async (): Promise<AddressOrder[]> => {
    try {
        const response = await api.get<AddressOrder[]>(`/Addresses/shop-address`);
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

export const getAddressById = async (id: number): Promise<Address> => {
    try {
        const response = await api.get<Address>(`/Addresses/${id}`);
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

export const updateAddress = async (addressId: number, data: {
    region?: string;
    city: string;
    street: string;
    house?: string;
    isShop?: boolean;
}, userId: number): Promise<void> => {
    try {
        const cleanedData = {
            region: data.region || undefined,
            city: data.city,
            street: data.street,
            house: data.house || undefined,
            isShop: data.isShop
        };
        await api.put<Address>(`/Addresses/update-address?addressId=${addressId}&userId=${userId}`, cleanedData);
    } catch (error: any) {
        if (error.response) {
            throw {
                message: error.response.data?.message || 'Не удалось обновить адрес',
                statusCode: error.response.status
            };
        }
        throw { message: 'Нет ответа от сервера', isNetworkError: true };
    }
};