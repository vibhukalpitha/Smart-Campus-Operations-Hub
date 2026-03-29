import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Request interceptor to add JWT token if exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauthenticated requests globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData)
};

export const notificationService = {
    getAll: () => api.get('/notifications'),
    create: (notificationData) => api.post('/notifications', notificationData),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    delete: (id) => api.delete(`/notifications/${id}`)
};

export default api;
