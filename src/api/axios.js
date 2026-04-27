import axios from 'axios';

// Instance for standard Microservices (via Gateway)
const api = axios.create({
    baseURL: 'http://localhost:8080', 
    withCredentials: true 
});

// ✅ Instance for Website-Controller (BFF / Port 9000)
export const webApi = axios.create({
    baseURL: 'http://localhost:9000/api', 
    withCredentials: true 
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
        (error) => {
            const status = error.response?.status;
            if (status === 401) {
                localStorage.clear();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

setupInterceptors(api);
setupInterceptors(webApi);

export default api;