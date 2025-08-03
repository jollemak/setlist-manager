// Export all API services
export { default as apiClient } from './api.js';
export { default as authService } from './auth.js';
export { default as songsService } from './songs.js';
export { default as setlistsService } from './setlists.js';

// You can also create shortcuts for common operations
export const api = {
  auth: () => import('./auth.js').then(m => m.default),
  songs: () => import('./songs.js').then(m => m.default),
  setlists: () => import('./setlists.js').then(m => m.default),
};
