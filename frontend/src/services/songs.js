import apiClient from './api.js';

class SongsService {
  // Get all songs with optional search and pagination
  async getSongs(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      
      const endpoint = `/songs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch songs');
    }
  }

  // Get single song by ID
  async getSong(id) {
    try {
      const response = await apiClient.get(`/songs/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch song');
    }
  }

  // Create new song
  async createSong(songData) {
    try {
      const response = await apiClient.post('/songs', songData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create song');
    }
  }

  // Update existing song
  async updateSong(id, songData) {
    try {
      const response = await apiClient.put(`/songs/${id}`, songData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update song');
    }
  }

  // Delete song
  async deleteSong(id) {
    try {
      const response = await apiClient.delete(`/songs/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete song');
    }
  }
}

// Create a singleton instance
const songsService = new SongsService();

export default songsService;
