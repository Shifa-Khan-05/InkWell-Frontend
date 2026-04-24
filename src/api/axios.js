import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // ✅ Always route through Gateway
    withCredentials: true 
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== "null" && token !== "undefined") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const currentPath = window.location.pathname;

        // ✅ ONLY redirect on 401 Unauthorized
        // Check for currentPath ensures we don't loop on the login page itself
        if (status === 401 && currentPath !== '/login' && currentPath !== '/register') {
            console.warn("Session Expired or Unauthorized - Redirecting...");
            localStorage.clear();
            window.location.href = '/login';
        }
        
        if (status === 404) {
            console.error("Resource not found: ", error.config.url);
        }

        return Promise.reject(error);
    }
);

export default api;