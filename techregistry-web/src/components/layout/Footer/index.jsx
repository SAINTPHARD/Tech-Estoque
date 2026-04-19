/**
 * Arquivo: src/components/layout/Footer/index.jsx
 * Responsabilidade: renderizar o rodape institucional da interface.
 * O que voce encontra aqui: resumo do ambiente, atalhos e situacao da sessao.
 * Quando mexer: altere este arquivo se o rodape da aplicacao mudar.
 */

import {
  CircleHelp,
  LogIn,
  LogOut,
  ServerCog,
  ShieldCheck,
  Settings2,
} from 'lucide-react';
import { formatDateTime } from '../../../utils/datePicker';
import './style.css';

export default function Footer({
  productCount = 0,
  apiBaseUrl = '/api',
  lastUpdated = null,
  isAuthenticated = false,
  operatorLogin = '',
  onHelp,
  onAuthAction,
  onOpenSettings,
}) {
  return (
    <footer className="footer-shell">
      <div className="footer-card">
        <div className="footer-brand">
          <span className="footer-brand-mark">TR</span>

          <div>
            <strong>TechRegistry Web</strong>
            <p>Painel React + Vite integrado ao backend Spring Boot com JWT.</p>
          </div>
        </div>

        <div className="footer-stats">
          <article className="footer-stat">
            <span>Produtos em memoria</span>
            <strong>{productCount}</strong>
          </article>

          <article className="footer-stat">
            <span>API base</span>
            <strong>{apiBaseUrl}</strong>
          </article>

          <article className="footer-stat">
            <span>Sessao atual</span>
            <strong>{isAuthenticated ? operatorLogin || 'Operador autenticado' : 'Modo leitura'}</strong>
          </article>

          <article className="footer-stat">
            <span>Ultima sincronizacao</span>
            <strong>{lastUpdated ? formatDateTime(lastUpdated) : 'Aguardando leitura inicial'}</strong>
          </article>
        </div>

        <div className="footer-actions">
          <button type="button" className="footer-action-button" onClick={() => onHelp?.()}>
            <CircleHelp size={16} />
            Ajuda
          </button>

          <button type="button" className="footer-action-button" onClick={() => onOpenSettings?.()}>
            <Settings2 size={16} />
            Configuracoes
          </button>

          <button
            type="button"
            className="footer-action-button footer-action-button-primary"
            onClick={() => onAuthAction?.()}
          >
            {isAuthenticated ? <LogOut size={16} /> : <LogIn size={16} />}
            {isAuthenticated ? 'Sair' : 'Login'}
          </button>
        </div>

        <div className="footer-meta">
          <span>
            <ShieldCheck size={14} />
            GET publico e operacoes de escrita protegidas por token.
          </span>

          <span>
            <ServerCog size={14} />
            {`Atualizado para refletir o backend em ${new Date().getFullYear()}.`}
          </span>
        </div>
      </div>
    </footer>
  );
}
