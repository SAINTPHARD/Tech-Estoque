/**
 * Arquivo: src/services/api.js
 * Responsabilidade: centralizar a configuracao do Axios e o tratamento basico de erros da API.
 * O que voce encontra aqui: baseURL, timeout, alvo do proxy do Vite e funcoes para montar mensagens amigaveis.
 * Quando mexer: altere este arquivo quando a integracao HTTP do projeto mudar.
 */

import axios from 'axios';

// Le as variaveis do Vite e aplica valores padrao para o desenvolvimento local.
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
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
  // Tenta extrair uma mensagem mais clara enviada pelo backend.
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
  // Explica para o usuario qual endereco a aplicacao tentou acessar.
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
  // Converte erros tecnicos da requisicao em textos mais didaticos para a interface.
  const fallbackMessage =
    'Nao foi possivel carregar os produtos agora. Verifique o backend e tente novamente.';
  const requestPath = error?.config?.url || path;
  const targetDescription = describeApiTarget(requestPath);
  const apiError = extractApiResponseMessage(error);

  if (error?.code === 'ECONNABORTED') {
    return {
      message: 'A API demorou demais para responder.',
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
  // Esta instancia evita repetir configuracoes em cada chamada de servico.
  baseURL,
  timeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;
