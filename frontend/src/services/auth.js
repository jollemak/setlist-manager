import apiClient from './api.js';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.success && response.data.token) {
        apiClient.setToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.success && response.data.token) {
        apiClient.setToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout user
  logout() {
    apiClient.clearToken();
    // You can also call a logout endpoint if you implement server-side logout
    // await apiClient.post('/auth/logout');
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user data');
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!apiClient.getToken();
  }

  // Get stored token
  getToken() {
    return apiClient.getToken();
  }
}

// Create a singleton instance
const authService = new AuthService();

export default authService;
