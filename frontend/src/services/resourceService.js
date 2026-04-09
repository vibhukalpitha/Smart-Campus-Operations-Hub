import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/resources';

const resourceService = {
  /**
   * Get all resources
   */
  getAllResources: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  /**
   * Get resource by ID
   */
  getResourceById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resource with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new resource
   */
  createResource: async (data) => {
    try {
      const response = await axios.post(API_BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  /**
   * Update an existing resource
   */
  updateResource: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating resource with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a resource
   */
  deleteResource: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting resource with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search resources with filters
   */
  searchResources: async (params) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: params,
      });
      return response.data;
    } catch (error) {
      console.error('Error searching resources:', error);
      throw error;
    }
  },

  /**
   * Get resources by type
   */
  getResourcesByType: async (type) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resources by type ${type}:`, error);
      throw error;
    }
  },

  /**
   * Get resources by location
   */
  getResourcesByLocation: async (location) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/location/${location}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resources by location ${location}:`, error);
      throw error;
    }
  },

  /**
   * Get all active resources
   */
  getActiveResources: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active resources:', error);
      throw error;
    }
  },
};

export default resourceService;
