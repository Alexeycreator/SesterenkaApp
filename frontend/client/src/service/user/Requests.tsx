import api from '../core/Axios.config';
import { UserResponse, CreateClientRequest, UpdateClientRequest, SearchClientsParams } from './Types';

export const clientApi = {
    // Получить всех клиентов - GET /api/Clients
    getAll: async (): Promise<UserResponse[]> => {
        const response = await api.get<UserResponse[]>('/Users');
        return response.data;
    },

    // Получить клиента по ID - GET /api/Clients/{id}
    getById: async (id: number): Promise<UserResponse> => {
        const response = await api.get<UserResponse>(`/Users/${id}`);
        return response.data;
    },

    // Создать клиента - POST /api/Clients/register (используем register)
    create: async (data: CreateClientRequest): Promise<UserResponse> => {
        const response = await api.post<UserResponse>('/Users/register', data);
        return response.data;
    },

    // Обновить клиента - PUT /api/Clients/{id}
    update: async (id: number, data: UpdateClientRequest): Promise<void> => {
        await api.put(`/Users/${id}`, data);
    },

    // Удалить клиента - DELETE /api/Clients/{id}
    delete: async (id: number): Promise<void> => {
        await api.delete(`/Users/${id}`);
    },


    // Проверить уникальность логина - GET /api/Clients/check-login?login={login}
    checkLoginUnique: async (login: string): Promise<boolean> => {
        const response = await api.get<boolean>(`/Users/check-login?login=${login}`);
        return response.data;
    },

    // Проверить уникальность email - GET /api/Clients/check-email?email={email}
    checkEmailUnique: async (email: string): Promise<boolean> => {
        const response = await api.get<boolean>(`/Users/check-email?email=${email}`);
        return response.data;
    },

    // Поиск клиентов по фамилии - GET /api/Clients/search?surname={surname}
    searchBySurname: async (params: SearchClientsParams): Promise<UserResponse[]> => {
        const response = await api.get<UserResponse[]>(`/Users/search?surname=${params.surname}`);
        return response.data;
    }
};

// Для обратной совместимости экспортируем отдельно
export const getClients = clientApi.getAll;
export const getClientById = clientApi.getById;
export const createClient = clientApi.create;
export const updateClient = clientApi.update;
export const deleteClient = clientApi.delete;
export const checkLoginUnique = clientApi.checkLoginUnique;
export const checkEmailUnique = clientApi.checkEmailUnique;
export const searchClientsBySurname = clientApi.searchBySurname;