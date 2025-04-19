// API utility functions

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Generic fetch function with credentials
export const fetchWithCredentials = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};

// Auth endpoints
export const authApi = {
  check: () => fetchWithCredentials('/api/auth/check'),
  google: (code: string) => fetchWithCredentials('/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  }),
  logout: () => fetchWithCredentials('/api/auth/logout', {
    method: 'POST',
  }),
};

// Words endpoints
export const wordsApi = {
  getAll: () => fetchWithCredentials('/api/words'),
  getById: (id: number) => fetchWithCredentials(`/api/words/${id}`),
  getByWord: (word: string) => fetchWithCredentials(`/api/words/word/${encodeURIComponent(word)}`),
  create: (word: any) => fetchWithCredentials('/api/words', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(word),
  }),
  update: (id: number, word: any) => fetchWithCredentials(`/api/words/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(word),
  }),
  delete: (id: number) => fetchWithCredentials(`/api/words/${id}`, {
    method: 'DELETE',
  }),
}; 