/**
 * Arquivo: src/components/common/LoginDialog/index.jsx
 * Responsabilidade: exibir o modal de login do operador.
 * O que voce encontra aqui: formulario de login com feedback local e atalho de fechamento.
 * Quando mexer: altere este arquivo quando o fluxo de autenticacao do frontend mudar.
 */

import { LoaderCircle, LockKeyhole, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './style.css';

const emptyCredentials = {
  login: '',
  senha: '',
};

export default function LoginDialog({
  isOpen = false,
  busy = false,
  initialLogin = '',
  onClose,
  onSubmit,
}) {
  const [credentials, setCredentials] = useState(emptyCredentials);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setCredentials({
      login: initialLogin,
      senha: '',
    });
    setFormError('');

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [initialLogin, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (fieldName, fieldValue) => {
    if (formError) {
      setFormError('');
    }

    setCredentials((currentState) => ({
      ...currentState,
      [fieldName]: fieldValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!credentials.login.trim() || !credentials.senha.trim()) {
      setFormError('Informe login e senha para continuar.');
      return;
    }

    const result = await onSubmit?.({
      login: credentials.login.trim(),
      senha: credentials.senha,
    });

    if (!result?.ok) {
      setFormError(result?.message || 'Nao foi possivel entrar agora.');
    }
  };

  return (
    <div className="dialog-backdrop" role="presentation" onClick={() => onClose?.()}>
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <div>
            <span className="dialog-kicker">Acesso do operador</span>
            <h2 id="login-dialog-title">Entrar para liberar o CRUD</h2>
            <p>Use o mesmo login configurado no backend Spring para criar, editar e excluir.</p>
          </div>

          <button
            type="button"
            className="dialog-close-button"
            onClick={() => onClose?.()}
            aria-label="Fechar login"
          >
            <X size={18} />
          </button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          {formError ? (
            <div className="form-feedback form-feedback-error">
              <strong>Falha na autenticacao.</strong>
              <span>{formError}</span>
            </div>
          ) : null}

          <label className="form-field">
            <span>Login</span>
            <div className="dialog-input-shell">
              <UserRound size={16} />
              <input
                className="form-input dialog-input"
                value={credentials.login}
                onChange={(event) => handleChange('login', event.target.value)}
                placeholder="Seu login do backend"
                autoFocus
              />
            </div>
          </label>

          <label className="form-field">
            <span>Senha</span>
            <div className="dialog-input-shell">
              <LockKeyhole size={16} />
              <input
                className="form-input dialog-input"
                type="password"
                value={credentials.senha}
                onChange={(event) => handleChange('senha', event.target.value)}
                placeholder="Senha do operador"
              />
            </div>
          </label>

          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={() => onClose?.()}>
              Cancelar
            </button>

            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle size={16} className="button-spinner" />
                  Entrando
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
