// API utility functions

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL ? 
  (import.meta.env.VITE_API_URL.startsWith('http') ? 
    import.meta.env.VITE_API_URL : 
    `https://${import.meta.env.VITE_API_URL}`) : 
  'http://localhost:5000';
console.log('API_URL:', API_URL); // Debug log

// Generic fetch function with credentials
export const fetchWithCredentials = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  console.log('Fetching URL:', url, 'with options:', {
    method: options.method || 'GET',
    credentials: options.credentials || 'include',
    headers: options.headers
  });

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('Response received:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Auth endpoints
export const authApi = {
  check: () => fetchWithCredentials('/api/auth/check'),
  google: (code: string) => fetchWithCredentials('/api/auth/google', {
    method: 'POST',
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
  getByMotif: (motif: string) => fetchWithCredentials(`/api/words/motif/${encodeURIComponent(motif)}`),
  create: (word: any) => fetchWithCredentials('/api/words', {
    method: 'POST',
    body: JSON.stringify(word),
  }),
  update: (id: number, word: any) => fetchWithCredentials(`/api/words/${id}`, {
    method: 'PUT',
    body: JSON.stringify(word),
  }),
  delete: (id: number) => fetchWithCredentials(`/api/words/${id}`, {
    method: 'DELETE',
  }),
}; 