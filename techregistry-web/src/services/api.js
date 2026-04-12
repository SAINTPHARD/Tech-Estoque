/**
 * Arquivo: src/services/api.js
 * Responsabilidade: centralizar a configuracao do Axios e injetar o Token JWT.
 */

import axios from "axios";

// Configurações lidas do ambiente Vite
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "/api";
const baseURL = rawBaseURL.replace(/\/$/, "");
const timeout = Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000);
const proxyTarget = (
  import.meta.env.VITE_API_PROXY_TARGET || "http://localhost:8081"
).replace(/\/$/, "");

export const apiRuntimeConfig = {
  baseURL,
  timeout,
  proxyTarget,
  usesDevProxy: import.meta.env.DEV && baseURL.startsWith("/"),
};

// --- Funções Auxiliares de Tratamento de Erro ---

function isAbsoluteUrl(value = "") {
  return /^https?:\/\//i.test(value);
}

function extractApiResponseMessage(error) {
  const responseData = error?.response?.data;
  if (!responseData || typeof responseData !== "object") return null;

  const details = Array.isArray(responseData.details)
    ? responseData.details.filter(Boolean)
    : [];

  return { message: responseData.message || null, details };
}

export function describeApiTarget(path = "") {
  if (isAbsoluteUrl(path)) return path;
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  if (apiRuntimeConfig.usesDevProxy) {
    return `${baseURL}${normalizedPath} via proxy para ${proxyTarget}`;
  }
  return `${baseURL}${normalizedPath}`;
}

export function buildApiErrorFeedback(error, path = "") {
  const fallbackMessage =
    "Não foi possível carregar os dados. Verifique o backend.";
  const requestPath = error?.config?.url || path;
  const targetDescription = describeApiTarget(requestPath);
  const apiError = extractApiResponseMessage(error);

  // Tratamento específico para erro de Autenticação (403 ou 401)
  if (error?.response?.status === 403 || error?.response?.status === 401) {
    return {
      message: "Sessão expirada ou acesso negado.",
      hint: "Tente fazer login novamente.",
    };
  }

  if (error?.code === "ECONNABORTED") {
    return {
      message: "A API demorou demais para responder.",
      hint: `Destino: ${targetDescription}`,
    };
  }

  return {
    message: apiError?.message || fallbackMessage,
    hint: `Destino: ${targetDescription}`,
  };
}

// --- Instância Principal do Axios ---

const api = axios.create({
  baseURL,
  timeout,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * INTERCEPTOR DE REQUISIÇÃO
 * Este bloco é o "Pulo do Gato": ele injeta o Token JWT
 * em todas as chamadas feitas através da instância 'api'.
 */
api.interceptors.request.use(
  (config) => {
    // Buscamos o token que foi salvo no localStorage durante o login
    const token = localStorage.getItem("token");

    if (token) {
      // Padrão Bearer exigido pelo Spring Security que configuramos
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
