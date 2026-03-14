export interface LoginRequest {
    login: string;
    password: string;
}

export interface RegisterRequest {
    secondName: string;
    firstName: string;
    surName: string | null;
    phoneNumber: string;
    email: string;
    login: string;
    password: string;
}

// Данные пользователя (без пароля!) - соответствует ClientResponseDto на сервере
export interface UserData {
    id: number;
    secondName: string;
    firstName: string;
    surName: string | null;
    phoneNumber: string;
    email: string;
    login: string;
    gender: string;
    age: number;
    birthday: string;
    // Пароля здесь НЕТ!
}

// Ответ при успешном входе - соответствует LoginResponseDto на сервере
export interface LoginResponse {
    token: string;      // JWT токен
    expiry: string;     // Дата истечения (ISO string)
    user: UserData;     // Данные пользователя без пароля
}

// Ответ при регистрации
export interface RegisterResponse extends UserData {
    // Те же поля, что и UserData
}