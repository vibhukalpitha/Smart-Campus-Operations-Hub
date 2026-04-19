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
    register: (userData) => api.post('/auth/register', userData),
    githubLogin: (code) => api.post(`/auth/github?code=${code}`),
    googleLogin: (code) => api.post(`/auth/google?code=${code}`)
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

export const resourceService = {
    // Legacy aliases used by existing pages
    getAll: () => api.get('/resources'),
    getById: (id) => api.get(`/resources/${id}`),
    create: (data) => api.post('/resources', data),
    update: (id, data) => api.put(`/resources/${id}`, data),
    remove: (id) => api.delete(`/resources/${id}`),

    /**
     * Get all resources
     */
    getAllResources: (params = {}) => api.get('/resources', { params }),

    /**
     * Get resource by ID
     */
    getResourceById: (id) => api.get(`/resources/${id}`),

    /**
     * Create a new resource
     */
    createResource: (data) => api.post('/resources', data),

    /**
     * Update an existing resource
     */
    updateResource: (id, data) => api.put(`/resources/${id}`, data),

    /**
     * Delete a resource
     */
    deleteResource: (id) => api.delete(`/resources/${id}`),

    /**
     * Search resources with combined filters
     * Parameters are automatically sent only if they have values
     */
    searchResources: async (filters = {}, paging = {}) => {
        // Build clean params object - only include non-null values
        const params = Object.fromEntries(
            Object.entries({ ...filters, ...paging }).filter(([_, value]) => value !== null && value !== undefined && value !== '')
        );
        return api.get('/resources', { params });
    },

    /**
     * Get resources by type
     */
    getResourcesByType: (type, params = {}) => api.get('/resources', { params: { type, ...params } }),

    /**
     * Get resources by location
     */
    getResourcesByLocation: (location, params = {}) => api.get('/resources', { params: { location, ...params } }),

    /**
     * Get all active resources
     */
    getActiveResources: (params = {}) => api.get('/resources', { params: { status: 'ACTIVE', ...params } })
};

export const bookingService = {
    getAll: () => api.get('/bookings'),
    getEvents: () => api.get('/bookings/events'),
    getLecturerSessions: (resourceId) => api.get(`/bookings/resource/${resourceId}/sessions`),
    getAllLecturerSessions: () => api.get('/bookings/sessions/active'),
    create: (data) => api.post('/bookings', data),
    updateStatus: (id, status, reason) => api.put(`/bookings/${id}/status`, { status, reason }),
    cancel: (id) => api.delete(`/bookings/${id}`)
};

export default api;
