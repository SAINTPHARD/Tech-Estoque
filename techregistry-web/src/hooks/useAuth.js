/**
 * Arquivo: src/hooks/useAuth.js
 * Responsabilidade: controlar a sessao do operador no frontend.
 * O que voce encontra aqui: leitura da sessao salva, login e logout.
 * Quando mexer: use este hook quando a experiencia de autenticacao mudar.
 */

import { useEffect, useState } from 'react';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from '../services/api';
import {
  clearStoredOperatorLogin,
  getStoredOperatorLogin,
  loginOperator,
  setStoredOperatorLogin,
} from '../services/authService';

function readStoredSession() {
  return {
    isAuthenticated: Boolean(getStoredAccessToken()),
    operatorLogin: getStoredOperatorLogin(),
  };
}

export default function useAuth() {
  const [authState, setAuthState] = useState(() => ({
    ...readStoredSession(),
    busy: false,
  }));

  useEffect(() => {
    const handleStorage = () => {
      setAuthState((currentState) => ({
        ...currentState,
        ...readStoredSession(),
      }));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async ({ login: operatorLogin, senha }) => {
    setAuthState((currentState) => ({
      ...currentState,
      busy: true,
    }));

    try {
      const response = await loginOperator({
        login: operatorLogin,
        senha,
      });

      if (!response?.token) {
        setAuthState((currentState) => ({
          ...currentState,
          busy: false,
        }));

        return {
          ok: false,
          message: 'A API respondeu sem token. Revise o backend de autenticacao.',
        };
      }

      setStoredAccessToken(response.token);
      setStoredOperatorLogin(operatorLogin);

      setAuthState({
        isAuthenticated: true,
        operatorLogin,
        busy: false,
      });

      return {
        ok: true,
        message: `Sessao iniciada para ${operatorLogin}.`,
      };
    } catch (requestError) {
      setAuthState((currentState) => ({
        ...currentState,
        busy: false,
      }));

      return {
        ok: false,
        message:
          requestError?.response?.status === 401
            ? 'Credenciais invalidas. Revise login e senha.'
            : 'Nao foi possivel autenticar agora. Verifique a API e tente novamente.',
      };
    }
  };

  const logout = () => {
    clearStoredAccessToken();
    clearStoredOperatorLogin();

    setAuthState({
      isAuthenticated: false,
      operatorLogin: '',
      busy: false,
    });

    return {
      ok: true,
      message: 'Sessao encerrada com sucesso.',
    };
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    operatorLogin: authState.operatorLogin,
    busy: authState.busy,
    actions: {
      login,
      logout,
    },
  };
}
