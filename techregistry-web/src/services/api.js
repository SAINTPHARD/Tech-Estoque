/**
 * Arquivo: src/services/api.js
 * Responsabilidade: centralizar a configuracao do Axios e o acesso ao token JWT.
 */

import axios from 'axios';

const ACCESS_TOKEN_KEY = 'token';

function normalizeBaseUrl(value, fallback = '/api') {
  const safeValue =
    typeof value === 'string' && value.trim() ? value.trim() : fallback;

  return safeValue.replace(/\/$/, '');
}

function resolveTimeout(value, fallback = 10000) {
  const parsedTimeout = Number(value);

  return Number.isFinite(parsedTimeout) && parsedTimeout > 0
    ? parsedTimeout
    : fallback;
}

export function getStoredAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Le as variaveis do Vite e aplica defaults seguros para desenvolvimento local.
const baseURL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const timeout = resolveTimeout(import.meta.env.VITE_API_TIMEOUT_MS);
const proxyTarget = normalizeBaseUrl(
  import.meta.env.VITE_API_PROXY_TARGET,
  'http://localhost:8080',
);

export const apiRuntimeConfig = {
  baseURL,
  timeout,
  proxyTarget,
  usesDevProxy: import.meta.env.DEV && baseURL.startsWith('/'),
};

function isAbsoluteUrl(value = '') {
  return /^https?:\/\//i.test(value);
}

function extractApiResponseMessage(error) {
  const responseData = error?.response?.data;

  if (!responseData || typeof responseData !== 'object') {
    return null;
  }

  const details = Array.isArray(responseData.details)
    ? responseData.details.filter(Boolean)
    : [];

  return {
    message: responseData.message || null,
    details,
  };
}

export function describeApiTarget(path = '') {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  if (apiRuntimeConfig.usesDevProxy) {
    return `${baseURL}${normalizedPath} via proxy para ${proxyTarget}`;
  }

  return `${baseURL}${normalizedPath}`;
}

export function buildApiErrorFeedback(error, path = '') {
  const fallbackMessage =
    'Nao foi possivel carregar os dados. Verifique o backend.';
  const requestPath = error?.config?.url || path;
  const targetDescription = describeApiTarget(requestPath);
  const apiError = extractApiResponseMessage(error);

  if (error?.response?.status === 403 || error?.response?.status === 401) {
    return {
      message: 'Sessao expirada ou acesso negado.',
      hint: 'Faca login novamente para liberar criacao, edicao e exclusao.',
    };
  }

  if (error?.code === 'ECONNABORTED') {
    return {
      message: 'A API demorou demais para responder.',
      hint: `Destino: ${targetDescription}`,
    };
  }

  return {
    message: apiError?.message || fallbackMessage,
    hint: `Destino: ${targetDescription}`,
  };
}

const api = axios.create({
  baseURL,
  timeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Todas as requests passam por aqui para manter o token e os headers consistentes.
    const token = getStoredAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
