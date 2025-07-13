import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Orders
  orders: {
    create: async (orderData) => {
      try {
        const response = await api.post('/orders', orderData);
        return response.data;
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    
    getAll: async () => {
      try {
        const response = await api.get('/orders');
        return response.data;
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },
    
    getById: async (orderId) => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
      }
    },
    
    update: async (orderId, updateData) => {
      try {
        const response = await api.put(`/orders/${orderId}`, updateData);
        return response.data;
      } catch (error) {
        console.error('Error updating order:', error);
        throw error;
      }
    },
    
    delete: async (orderId) => {
      try {
        const response = await api.delete(`/orders/${orderId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
      }
    },
    
    getByCustomer: async (customerId) => {
      try {
        const response = await api.get(`/orders/customer/${customerId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        throw error;
      }
    }
  },
  
  // Customers
  customers: {
    create: async (customerData) => {
      try {
        const response = await api.post('/customers', customerData);
        return response.data;
      } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
      }
    },
    
    getAll: async () => {
      try {
        const response = await api.get('/customers');
        return response.data;
      } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
    },
    
    getById: async (customerId) => {
      try {
        const response = await api.get(`/customers/${customerId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching customer:', error);
        throw error;
      }
    },
    
    update: async (customerId, updateData) => {
      try {
        const response = await api.put(`/customers/${customerId}`, updateData);
        return response.data;
      } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
      }
    },
    
    getByEmail: async (email) => {
      try {
        const response = await api.get(`/customers/email/${email}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching customer by email:', error);
        throw error;
      }
    }
  },
  
  // Products
  products: {
    getAll: async () => {
      try {
        const response = await api.get('/products');
        return response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
    
    getById: async (productId) => {
      try {
        const response = await api.get(`/products/${productId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    },
    
    getByCategory: async (category) => {
      try {
        const response = await api.get(`/products/category/${category}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }
    },
    
    create: async (productData) => {
      try {
        const response = await api.post('/products', productData);
        return response.data;
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    },
    
    update: async (productId, updateData) => {
      try {
        const response = await api.put(`/products/${productId}`, updateData);
        return response.data;
      } catch (error) {
        console.error('Error updating product:', error);
        throw error;
      }
    },
    
    delete: async (productId) => {
      try {
        const response = await api.delete(`/products/${productId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    }
  },
  
  // Notifications
  notifications: {
    getAll: async () => {
      try {
        const response = await api.get('/notifications');
        return response.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
    },
    
    markAsRead: async (notificationId) => {
      try {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return response.data;
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },
    
    getUnreadCount: async () => {
      try {
        const response = await api.get('/notifications/unread-count');
        return response.data;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
      }
    }
  },
  
  // Sync
  sync: {
    uploadPendingData: async (syncData) => {
      try {
        const response = await api.post('/sync/upload', syncData);
        return response.data;
      } catch (error) {
        console.error('Error uploading sync data:', error);
        throw error;
      }
    },
    
    downloadUpdates: async (lastSyncTime) => {
      try {
        const response = await api.get(`/sync/download?lastSync=${lastSyncTime}`);
        return response.data;
      } catch (error) {
        console.error('Error downloading updates:', error);
        throw error;
      }
    }
  },
  
  // Health check
  health: {
    check: async () => {
      try {
        const response = await api.get('/health');
        return response.data;
      } catch (error) {
        console.error('Error checking health:', error);
        throw error;
      }
    }
  },
  
  // Distributors
  distributors: {
    getAll: async () => {
      try {
        const response = await api.get('/distributors');
        return response.data;
      } catch (error) {
        console.error('Error fetching distributors:', error);
        throw error;
      }
    },
    
    getById: async (distributorId) => {
      try {
        const response = await api.get(`/distributors/${distributorId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching distributor:', error);
        throw error;
      }
    },
    
    create: async (distributorData) => {
      try {
        const response = await api.post('/distributors', distributorData);
        return response.data;
      } catch (error) {
        console.error('Error creating distributor:', error);
        throw error;
      }
    },
    
    update: async (distributorId, updateData) => {
      try {
        const response = await api.put(`/distributors/${distributorId}`, updateData);
        return response.data;
      } catch (error) {
        console.error('Error updating distributor:', error);
        throw error;
      }
    }
  },

  // Events
  events: {
    getAll: async () => {
      try {
        const response = await api.get('/events');
        return response.data;
      } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
    },

    create: async (eventData) => {
      try {
        const response = await api.post('/events', eventData);
        return response.data;
      } catch (error) {
        console.error('Error creating event:', error);
        throw error;
      }
    },

    update: async (eventId, updateData) => {
      try {
        const response = await api.put(`/events/${eventId}`, updateData);
        return response.data;
      } catch (error) {
        console.error('Error updating event:', error);
        throw error;
      }
    },

    delete: async (eventId) => {
      try {
        const response = await api.delete(`/events/${eventId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
      }
    }
  },

  // Product Media
  productMedia: {
    getImages: async (productId) => {
      try {
        const response = await api.get(`/products/${productId}/images`);
        return response.data;
      } catch (error) {
        console.error('Error fetching product images:', error);
        throw error;
      }
    },

    addImage: async (productId, imageData) => {
      try {
        const response = await api.post(`/products/${productId}/images`, imageData);
        return response.data;
      } catch (error) {
        console.error('Error adding product image:', error);
        throw error;
      }
    },

    deleteImage: async (imageId) => {
      try {
        const response = await api.delete(`/products/images/${imageId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting product image:', error);
        throw error;
      }
    },

    getVideos: async (productId) => {
      try {
        const response = await api.get(`/products/${productId}/videos`);
        return response.data;
      } catch (error) {
        console.error('Error fetching product videos:', error);
        throw error;
      }
    },

    addVideo: async (productId, videoData) => {
      try {
        const response = await api.post(`/products/${productId}/videos`, videoData);
        return response.data;
      } catch (error) {
        console.error('Error adding product video:', error);
        throw error;
      }
    }
  },

  // Content Blocks
  contentBlocks: {
    getAll: async (pageSection = null) => {
      try {
        const url = pageSection ? `/content-blocks?page_section=${pageSection}` : '/content-blocks';
        const response = await api.get(url);
        return response.data;
      } catch (error) {
        console.error('Error fetching content blocks:', error);
        throw error;
      }
    },

    create: async (blockData) => {
      try {
        const response = await api.post('/content-blocks', blockData);
        return response.data;
      } catch (error) {
        console.error('Error creating content block:', error);
        throw error;
      }
    },

    update: async (blockId, updateData) => {
      try {
        const response = await api.put(`/content-blocks/${blockId}`, updateData);
        return response.data;
      } catch (error) {
        console.error('Error updating content block:', error);
        throw error;
      }
    }
  }
};

// Check if online
export const checkOnlineStatus = async () => {
  try {
    await apiService.health.check();
    return true;
  } catch (error) {
    return false;
  }
};

export default api;
