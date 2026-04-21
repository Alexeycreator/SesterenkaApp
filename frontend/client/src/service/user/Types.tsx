import { UserData } from '../auth/Types';

// Для создания клиента (совпадает с RegisterRequest)
export interface CreateClientRequest {
    secondName: string;
    firstName: string;
    surName?: string | null;
    phoneNumber: string;
    email: string;
    login: string;
    password: string;
}

// Для обновления клиента
export interface UpdateClientRequest {
    secondName?: string;
    firstName?: string;
    surName?: string | null;
    phoneNumber?: string;
    email?: string;
    login?: string;
    password?: string;
}

// Ответ с данными клиента (без пароля)
export interface UserResponse extends UserData {
    // Наследуем все поля от UserData
}

// Для поиска по фамилии
export interface SearchClientsParams {
    surname: string;
}

// Для проверки уникальности
export interface CheckUniqueResponse {
    isUnique: boolean;
}

export interface ChangePasswordRequest {
    userId: number;
    oldPassword: string;
    newPassword: string;
}