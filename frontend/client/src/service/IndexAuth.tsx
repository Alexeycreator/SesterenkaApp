export { default as api } from './core/Axios.config';
export * from './auth/Types';
export * from './auth/Requests';
export * from './user/Types';
export * from './user/Requests';

// Удобные объекты для импорта
export { authApi } from './auth/Requests';
export { clientApi } from './user/Requests';