// src/services/anexoApi.ts
import axios from 'axios';

// ========================================
// API PARA ANEXO-SERVICE (DIRETO - PORTA 8087)
// ========================================
// ⚠️ Chamando DIRETO porque o GatewayAuthenticationFilter está desabilitado
const ANEXO_SERVICE_URL = 'http://localhost:8087';

export const anexoApi = axios.create({
    baseURL: ANEXO_SERVICE_URL,
    timeout: 120000, // 2 minutos (arquivos grandes)
    headers: {
        'Content-Type': 'application/json'
    },
});

// ========================================
// INTERCEPTOR DE REQUEST
// ========================================
anexoApi.interceptors.request.use(
    (config) => {
        // Adicionar token JWT se existir
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log para debug
        console.log(`[AnexoApi] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

        return config;
    },
    (error) => {
        console.error('[AnexoApi Request Error]', error);
        return Promise.reject(error);
    }
);

// ========================================
// INTERCEPTOR DE RESPONSE
// ========================================
anexoApi.interceptors.response.use(
    (response) => {
        console.log(`[AnexoApi] ✅ ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        // Log detalhado do erro
        console.error('[AnexoApi] ❌', {
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message,
        });

        // Se não autenticado, redirecionar para login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default anexoApi;
