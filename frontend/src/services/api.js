import axios from 'axios';

// VITE_API_URL deve ser definida em frontend/.env.local (dev) ou no painel do Vercel (produção).
// Veja frontend/.env.example para referência.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Interceptor para injetar o JWT token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@DankeMotorsport:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
