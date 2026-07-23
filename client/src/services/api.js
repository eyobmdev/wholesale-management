import axios from 'axios';


// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach auth tokens to requests here
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (like 401 Unauthorized) here
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to get a new access token
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, {
          refresh: refreshToken
        });

        // If successful, save the new token
        if (res.data.access) {
          localStorage.setItem('access_token', res.data.access);
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          const retryResponse = await axios(originalRequest);
          return retryResponse.data; // Ensure we return the .data of the retry
        }
      } catch (refreshError) {
        // If refresh fails, log out the user
        console.warn('Session expired. Logging out...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For all other errors, reject with the response data (the JSON from django)
    if (error.response) {
      return Promise.reject(error.response.data);
    }

    // Network errors or timeout
    return Promise.reject(error);
  }
);

export default api;
