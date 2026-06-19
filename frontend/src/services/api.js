/**
 * @file api.js
 * @description Instância configurada do axios para comunicação com a API Danke Motorsport.
 *
 * A URL base é lida de `VITE_API_URL` (variável de ambiente Vite).
 * Em desenvolvimento, defina em `frontend/.env.local`.
 * Em produção, configure no painel do Vercel (Environment Variables).
 *
 * Um interceptor de request injeta automaticamente o token JWT
 * armazenado no localStorage em todas as requisições autenticadas.
 */

import axios from 'axios';

/**
 * Instância axios pré-configurada com baseURL e interceptor de autenticação.
 * Importe este objeto em vez de usar `axios` diretamente nos componentes.
 *
 * @example
 * import api from '../services/api';
 * const response = await api.get('/danke/revisao/cliente');
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

/**
 * Interceptor de request: anexa o Bearer token JWT a cada requisição.
 * O token é lido de `localStorage` sob a chave `@DankeMotorsport:token`.
 * Se não houver token (usuário não autenticado), a requisição segue sem o header.
 */
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
