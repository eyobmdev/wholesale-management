import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api', // Update this based on your Django setup
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach auth tokens to requests here
api.interceptors.request.use(
  (config) => {
    // Example: Get token from localStorage
    // const token = localStorage.getItem('access_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (like 401 Unauthorized) here
api.interceptors.response.use(
  (response) => response.data, // By default, just return the data object
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login, refresh token)
        console.warn('Unauthorized! Redirecting to login...');
      }
      return Promise.reject(error.response.data);
    }
    // Network errors or timeout
    return Promise.reject(error);
  }
);

export default api;
