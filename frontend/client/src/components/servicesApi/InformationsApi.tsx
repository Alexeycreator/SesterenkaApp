/* eslint-disable no-throw-literal */
import React from "react";
import axios from "axios";
import { Address } from "./AddressesApi";
import { UserData } from "../../service/IndexAuth";

const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: apiUrl || "http://localhost:5027/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Information {
    id: number;
    aboutUs: string[] | null;
    questions: string[] | null;
    ourMission: string[] | null;
    ourValues: string[] | null;
    usersInfo?: UserData[] | null;
    addressesInfo?: Address[] | null;
};

export const getInformations = async (): Promise<Information[]> => {
    try {
        const response = await api.get<Information[]>('/Informations/data-information-page');
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

export const getInformationById = async (id: number): Promise<Information> => {
    try {
        const response = await api.get<Information>(`/Informations/${id}`);
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