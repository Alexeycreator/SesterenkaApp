/* eslint-disable no-throw-literal */
import api from '../core/Axios.config';
import { UserResponse, CreateClientRequest, UpdateClientRequest, SearchClientsParams, ChangePasswordRequest } from './Types';

export const clientApi = {
    // Получить всех клиентов - GET /api/Users
    getAll: async (): Promise<UserResponse[]> => {
        try {
            const response = await api.get<UserResponse[]>('/Users');
            return response.data;
        } catch (error: any) {
            console.error('Ошибка получения списка клиентов:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.message || 'Не удалось получить список клиентов',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    },

    // Получить клиента по ID - GET /api/Users/{id}
    getById: async (id: number): Promise<UserResponse> => {
        try {
            const response = await api.get<UserResponse>(`/Users/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Ошибка получения клиента:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.message || 'Не удалось получить данные клиента',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    },

    // Создать клиента - POST /api/Users/register
    create: async (data: CreateClientRequest): Promise<UserResponse> => {
        try {
            // Формируем данные в том формате, который ожидает сервер
            const requestData = {
                secondName: data.secondName,
                firstName: data.firstName,
                surName: data.surName || null,
                gender: data.gender,
                birthday: data.birthday,
                age: data.age,
                phoneNumber: data.phoneNumber,
                email: data.email,
                login: data.login,
                password: data.password,
                role: data.role,
                position: data.position  // Теперь всегда передаем строку "пользователь"
            };

            console.log('Отправляем данные на сервер:', requestData);

            const response = await api.post<UserResponse>('/Users/register', requestData);
            return response.data;
        } catch (error: any) {
            console.error('Ошибка создания клиента:', error);
            if (error.response) {
                console.error('Статус ошибки:', error.response.status);
                console.error('Данные ошибки:', error.response.data);
                throw {
                    message: error.response.data?.message || 'Не удалось создать клиента',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    },

    // Обновить клиента - PUT /api/Users/{id}
    update: async (id: number, data: UpdateClientRequest): Promise<void> => {
        try {
            await api.put(`/Users/${id}`, data);
        } catch (error: any) {
            console.error('Ошибка обновления клиента:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.message || 'Не удалось обновить данные клиента',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    },

    // Удалить клиента - DELETE /api/Users/{id}
    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/Users/${id}`);
        } catch (error: any) {
            console.error('Ошибка удаления клиента:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.message || 'Не удалось удалить клиента',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    },

    // Изменить пароль - PUT /api/Users/changePassword
    changePassword: async (userId: number, oldPassword: string, newPassword: string): Promise<void> => {
        try {
            const response = await api.put('/Users/changePassword', null, {
                params: {
                    userId: userId,
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Ошибка смены пароля:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.message || 'Не удалось изменить пароль',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    },

    // Проверить уникальность логина - GET /api/Users/check-login?login={login}
    checkLoginUnique: async (login: string): Promise<boolean> => {
        try {
            const response = await api.get<boolean>(`/Users/check-login?login=${login}`);
            return response.data;
        } catch (error: any) {
            console.error('Ошибка проверки логина:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.message || 'Не удалось проверить логин',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    },

    // Проверить уникальность email - GET /api/Users/check-email?email={email}
    checkEmailUnique: async (email: string): Promise<boolean> => {
        try {
            const response = await api.get<boolean>(`/Users/check-email?email=${email}`);
            return response.data;
        } catch (error: any) {
            console.error('Ошибка проверки email:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.message || 'Не удалось проверить email',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    },

    // Поиск клиентов по фамилии - GET /api/Users/search?surname={surname}
    searchBySurname: async (surname: string): Promise<UserResponse[]> => {
        try {
            const response = await api.get<UserResponse[]>(`/Users/search?surname=${surname}`);
            return response.data;
        } catch (error: any) {
            console.error('Ошибка поиска клиентов:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.message || 'Не удалось выполнить поиск',
                    statusCode: error.response.status,
                    data: error.response.data
                };
            }
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        }
    }
};

// Для обратной совместимости экспортируем отдельно
export const getClients = clientApi.getAll;
export const getClientById = clientApi.getById;
export const createClient = clientApi.create;
export const updateClient = clientApi.update;
export const deleteClient = clientApi.delete;
export const changePassword = clientApi.changePassword;
export const checkLoginUnique = clientApi.checkLoginUnique;
export const checkEmailUnique = clientApi.checkEmailUnique;
export const searchClientsBySurname = clientApi.searchBySurname;