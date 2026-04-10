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
    register: (userData) => {
        // Check if userData is FormData
        if (userData instanceof FormData) {
            return api.post('/auth/register', userData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
        return api.post('/auth/register', userData);
    }
};

export const notificationService = {
    getAll: () => api.get('/notifications'),
    create: (notificationData) => api.post('/notifications', notificationData),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    delete: (id) => api.delete(`/notifications/${id}`)
};

export const userService = {
    getAllUsers: () => api.get('/users'),
    updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`/users/${id}`)
};

export const bookingService = {
    create: (data) => api.post('/bookings', data),
    getAll: () => api.get('/bookings'),
    updateStatus: (id, status, reason) => api.put(`/bookings/${id}/status`, { status, reason }),
    cancel: (id) => api.delete(`/bookings/${id}`)
};

export const resourceService = {
    getAll: () => api.get('/resources'),
    getById: (id) => api.get(`/resources/${id}`),
    create: (data) => api.post('/admin/resources', data),
    update: (id, data) => api.put(`/admin/resources/${id}`, data),
    delete: (id) => api.delete(`/admin/resources/${id}`)
};

export default api;
