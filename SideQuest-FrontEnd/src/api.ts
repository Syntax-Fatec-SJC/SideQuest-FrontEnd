import axios from 'axios';

// Esta API é para o seu serviço principal (ex: Tarefas) que pode estar na porta 8080
const API_BASE_URL = 'http://localhost:8080'; // Ou a porta do seu serviço principal

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        console.log(`[Axios] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('[Axios Request Error]', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`[Axios] ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[Axios] ', {
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data,
        });
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/login')) window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; // Exporta como default também para compatibilidade
