import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { VITE_BACKEND_URL } from '@/constants';

let headers = {
    Accept: "application/json",
};

// In development, use Vite proxy (relative path) to avoid CORS issues
// In production, use full backend URL
const useProxy = import.meta.env.DEV;
const backendUrl = VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
if (!useProxy && !backendUrl) {
    throw new Error('VITE_BACKEND_URL is required in production');
}

// Connection diagnostics
if (import.meta.env.DEV) {
    console.log('🔍 ========== API CONNECTION CONFIGURATION ==========');
    console.log('🌐 VITE_BACKEND_URL from constants:', VITE_BACKEND_URL);
    console.log('🌐 import.meta.env.VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
    console.log('🌐 Resolved backendUrl:', backendUrl);
    console.log('🌐 Using Vite proxy:', useProxy);
    console.log('🌐 Axios baseURL will be:', useProxy ? '/api/v1' : (backendUrl ? `${backendUrl}/api/v1` : '/api/v1'));
    console.log('===================================================');
}

if (!backendUrl && import.meta.env.DEV && !useProxy) {
    console.warn('⚠️ VITE_BACKEND_URL is not set. Using Vite proxy fallback.');
}
if (!backendUrl && !import.meta.env.DEV) {
    console.error('❌ VITE_BACKEND_URL is required but not set!');
}

// Validate URL format (only if not using proxy)
if (!useProxy && backendUrl && !backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
    console.error(`❌ Invalid VITE_BACKEND_URL format: ${backendUrl}. Must start with http:// or https://`);
}

// create axios instance
// Use relative path in dev (Vite proxy) or full URL in production
const Axios = axios.create({
    baseURL: useProxy ? '/api/v1' : `${backendUrl}/api/v1`,
    headers: headers,
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor for logging
Axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Log request details in development
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                baseURL: config.baseURL,
                data: config.data,
                headers: config.headers
            });
        }
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor for logging and retry logic
Axios.interceptors.response.use(
    (response) => {
        // Log response details in development
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // Log error details
        if (import.meta.env.DEV) {
            console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                code: error.code,
                message: error.message
            });
        }

        // Retry logic for network errors (transient failures)
        if (
            originalRequest &&
            !originalRequest._retry &&
            (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')
        ) {
            originalRequest._retry = true;
            
            // Only retry for network errors, not for 4xx/5xx responses
            if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
                console.log(`[API Retry] Retrying request to ${originalRequest.url}`);
                
                // Wait 1 second before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                try {
                    return await Axios(originalRequest);
                } catch (retryError) {
                    console.error('[API Retry Failed]', retryError);
                    return Promise.reject(retryError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default Axios;