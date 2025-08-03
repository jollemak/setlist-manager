import apiClient from './api.js';

class SetlistsService {
  // Get all setlists with optional search and pagination
  async getSetlists(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      
      const endpoint = `/setlists${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch setlists');
    }
  }

  // Get single setlist by ID with all songs
  async getSetlist(id) {
    try {
      const response = await apiClient.get(`/setlists/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch setlist');
    }
  }

  // Create new setlist
  async createSetlist(setlistData) {
    try {
      const response = await apiClient.post('/setlists', setlistData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create setlist');
    }
  }

  // Update existing setlist
  async updateSetlist(id, setlistData) {
    try {
      const response = await apiClient.put(`/setlists/${id}`, setlistData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update setlist');
    }
  }

  // Delete setlist
  async deleteSetlist(id) {
    try {
      const response = await apiClient.delete(`/setlists/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete setlist');
    }
  }

  // Add song to setlist
  async addSongToSetlist(setlistId, songData) {
    try {
      const response = await apiClient.post(`/setlists/${setlistId}/songs`, songData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to add song to setlist');
    }
  }

  // Remove song from setlist
  async removeSongFromSetlist(setlistId, songId) {
    try {
      const response = await apiClient.delete(`/setlists/${setlistId}/songs/${songId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to remove song from setlist');
    }
  }

  // Reorder songs in setlist
  async reorderSongs(setlistId, songOrders) {
    try {
      const response = await apiClient.put(`/setlists/${setlistId}/reorder`, {
        songOrders
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reorder songs');
    }
  }
}

// Create a singleton instance
const setlistsService = new SetlistsService();

export default setlistsService;
