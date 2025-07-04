import axios from 'axios';
import config from '../config';

const sanctumApi = axios.create({
    baseURL: config.baseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
});

// Interceptor para adicionar o token em todas as requisições
sanctumApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de resposta
sanctumApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('Erro na resposta:', error.response || error);
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/auth/')) {
                window.location.href = '/auth/login';
            }
        }
        
        if (error.response?.status === 419) {
            // CSRF token mismatch, tentar obter novo token
            try {
                await sanctumApi.get('/sanctum/csrf-cookie');
                // Repetir a requisição original
                return sanctumApi(error.config);
            } catch (e) {
                console.error('Erro ao obter CSRF token:', e);
                return Promise.reject(e);
            }
        }
        
        return Promise.reject(error);
    }
);

export { sanctumApi }; 