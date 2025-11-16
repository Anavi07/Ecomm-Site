import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login if needed
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ==================== PRODUCT API ====================

export const productAPI = {
  // Get all products with filtering and pagination
  getProducts: (params = {}) => apiClient.get('/products', { params }),

  // Get single product by ID
  getProduct: (id) => apiClient.get(`/products/${id}`),

  // Create product (admin)
  createProduct: (productData) => apiClient.post('/products', productData),

  // Update product (admin)
  updateProduct: (id, productData) => apiClient.put(`/products/${id}`, productData),

  // Delete product (admin)
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // Add review to product
  addReview: (id, reviewData) => apiClient.post(`/products/${id}/reviews`, reviewData),
};

// ==================== USER API ====================

export const userAPI = {
  // Register new user
  register: (userData) => apiClient.post('/users/register', userData),

  // Login user
  login: (email, password) => apiClient.post('/users/login', { email, password }),

  // Get user profile
  getProfile: (userId) => apiClient.get(`/users/${userId}`),

  // Update user profile
  updateProfile: (userId, userData) => apiClient.put(`/users/${userId}`, userData),

  // Get all users (admin)
  getAllUsers: (params = {}) => apiClient.get('/users', { params }),

  // Delete user (admin)
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
};

// ==================== ORDER API ====================

export const orderAPI = {
  // Create new order
  createOrder: (orderData) => apiClient.post('/orders', orderData),

  // Get order by ID
  getOrder: (orderId) => apiClient.get(`/orders/${orderId}`),

  // Get user's orders
  getUserOrders: (userId, params = {}) => apiClient.get(`/orders/user/${userId}`, { params }),

  // Get all orders (admin)
  getAllOrders: (params = {}) => apiClient.get('/orders', { params }),

  // Update order status (admin)
  updateOrderStatus: (orderId, statusData) =>
    apiClient.put(`/orders/${orderId}`, statusData),
};

// ==================== UTILITY ====================

// Set auth token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common.Authorization;
  }
};

// Get auth token
export const getAuthToken = () => localStorage.getItem('authToken');

// Clear auth (logout)
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  delete apiClient.defaults.headers.common.Authorization;
};

export default apiClient;
