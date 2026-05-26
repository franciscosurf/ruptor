import axios from 'axios';
import { API_BASE_URL } from '../constants/endpoints';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Interceptor para manejar errores globalmente (opcional)
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;