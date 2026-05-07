import axios from 'axios';

function resolveApiBaseURL(): string {
  if (typeof window !== 'undefined') {
    const v = window.__TASKFACTORY_API_BASE__;
    if (typeof v === 'string' && v.length > 0) {
      return v.replace(/\/+$/, '');
    }
  }
  const env = import.meta.env.VITE_API_BASE_URL;
  if (typeof env === 'string' && env.length > 0) {
    return env.replace(/\/+$/, '');
  }
  return '/api';
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
