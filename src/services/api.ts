import axios from 'axios';
import { STORAGE_KEYS, storage } from './storage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.get(STORAGE_KEYS.authToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Fires whenever the API confirms our token is no longer valid, so the auth
 * store (which imports this module, not the other way around) can react
 * without this module needing to know about Pinia.
 */
export const UNAUTHORIZED_EVENT = 'api:unauthorized';

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  }
);
