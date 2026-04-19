/**
 * Arquivo: src/services/authService.js
 * Responsabilidade: centralizar login do operador e persistencia leve da sessao.
 */

import api from './api';

const OPERATOR_LOGIN_KEY = 'operator-login';

export async function loginOperator(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export function getStoredOperatorLogin() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(OPERATOR_LOGIN_KEY) || '';
}

export function setStoredOperatorLogin(login) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!login) {
    window.localStorage.removeItem(OPERATOR_LOGIN_KEY);
    return;
  }

  window.localStorage.setItem(OPERATOR_LOGIN_KEY, login);
}

export function clearStoredOperatorLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(OPERATOR_LOGIN_KEY);
}
