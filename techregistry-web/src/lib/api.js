import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const baseURL = rawBaseURL.replace(/\/$/, '');
const timeout = Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000);
const proxyTarget = (import.meta.env.VITE_API_PROXY_TARGET || 'http://localhost:8080').replace(/\/$/, '');

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

  const normalizedPath = path
    ? path.startsWith('/')
      ? path
      : `/${path}`
    : '';

  if (apiRuntimeConfig.usesDevProxy) {
    return `${baseURL}${normalizedPath} via proxy para ${proxyTarget}`;
  }

  return `${baseURL}${normalizedPath}`;
}

export function buildApiErrorFeedback(error, path = '') {
  const fallbackMessage =
    'Nao foi possivel carregar o inventario agora. Verifique o backend e tente novamente.';
  const requestPath = error?.config?.url || path;
  const targetDescription = describeApiTarget(requestPath);
  const apiError = extractApiResponseMessage(error);

  if (error?.code === 'ECONNABORTED') {
    return {
      message: 'A API demorou demais para responder ao painel.',
      hint: `Destino atual: ${targetDescription}.`,
    };
  }

  if (Number(error?.response?.status) === 404) {
    return {
      message:
        apiError?.message ||
        'A rota da API nao foi encontrada. Confirme se a aplicacao backend correta esta em execucao.',
      hint: `Destino atual: ${targetDescription}.`,
    };
  }

  if (apiError?.message) {
    return {
      message: apiError.message,
      hint: apiError.details.length
        ? `${apiError.details.join(' | ')} Destino atual: ${targetDescription}.`
        : `Destino atual: ${targetDescription}.`,
    };
  }

  if (apiRuntimeConfig.usesDevProxy && (!error?.response || Number(error.response.status) >= 500)) {
    return {
      message: fallbackMessage,
      hint: `Destino atual: ${targetDescription}. Se o backend estiver em outra porta, ajuste VITE_API_PROXY_TARGET.`,
    };
  }

  return {
    message: fallbackMessage,
    hint: import.meta.env.DEV ? `Destino atual: ${targetDescription}.` : '',
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

export default api;
