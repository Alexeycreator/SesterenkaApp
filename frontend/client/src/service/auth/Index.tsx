import { authApi } from './Requests';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserData } from './Types';

// Экспортируем всё необходимое
export { authApi };
export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserData };

export * from './Requests';
export * from './Types';

export const login = authApi.login;
export const register = authApi.register;
export const logout = authApi.logout;
export const getCurrentUser = authApi.getCurrentUser;
export const isAuthenticated = authApi.isAuthenticated;
export const getStoredUser = authApi.getStoredUser;