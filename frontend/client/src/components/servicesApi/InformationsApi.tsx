import React from "react";
import axios from "axios";
import { User } from "./UsersApi";
import { Address } from "./AddressesApi";

const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: apiUrl || "http://localhost:5027/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Information {
    id: number;
    aboutUs: string | null;
    questions: string | null;

    users_Id?: number | null;
    addresses_Id?: number | null;

    user?: User | null;
    address?: Address | null;
};

export const getInformations = async (): Promise<Information[]> => {
    const response = await api.get<Information[]>('/Informations');
    return response.data;
};

export const getInformationById = async (id: number): Promise<Information> => {
    try {
        const response = await api.get<Information>(`/Informations/${id}`);
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