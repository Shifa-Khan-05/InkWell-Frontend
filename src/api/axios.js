import axios from 'axios';

// Get base URL from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : 'http://localhost:8081';

// Instance for standard Microservices (via Gateway)
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Instance for Website-Controller (BFF / Port 8081)
export const webApi = axios.create({
    baseURL: `${BASE_URL}/api`,
    withCredentials: true,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const setupInterceptors = (instance) => {
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token && token !== "null" && token !== "undefined") {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const status = error.response?.status;
            const originalRequest = error.config;
            
            // Handle 401 Unauthorized
            if (status === 401 && !originalRequest._retry) {
                // Potential Refresh Token flow can go here.
                // For now, clear local storage and redirect to login
                console.warn('Unauthorized access, redirecting to login.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            // Global error masking for production
            let errorMessage = 'An unexpected error occurred. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message === 'Network Error') {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            }

            // Return a standard error format
            return Promise.reject({
                status: status || 500,
                message: errorMessage,
                originalError: error
            });
        }
    );
};

setupInterceptors(api);
setupInterceptors(webApi);

export default api;