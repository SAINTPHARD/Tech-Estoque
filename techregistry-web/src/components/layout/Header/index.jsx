/**
 * Arquivo: src/components/layout/Header/index.jsx
 * Responsabilidade: montar o cabecalho fixo do aplicativo.
 * O que voce encontra aqui: titulo da pagina, resumo rapido, controle da sidebar e acoes globais.
 * Quando mexer: altere este arquivo se a faixa superior da aplicacao mudar.
 */

import {
  Bell,
  CalendarDays,
  CircleUserRound,
  Download,
  LogIn,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
} from 'lucide-react';
import { formatDateLabel, formatDateTime } from '../../../utils/datePicker';

export default function Header({
  title,
  description,
  loading = false,
  downloadDisabled = false,
  isCompactLayout = false,
  isSidebarCollapsed = false,
  isAuthenticated = false,
  operatorLogin = '',
  authBusy = false,
  onOpenSidebar,
  onToggleSidebarCollapse,
  onRefresh,
  onDownloadReport,
  onNotification,
  onAuthAction,
}) {
  return (
    <header className="layout-header">
      <div className="header-row">
        <div className="header-leading">
          <div className="header-controls">
            {isCompactLayout ? (
              <button
                type="button"
                className="header-control-button"
                onClick={() => onOpenSidebar?.()}
                aria-label="Abrir menu lateral"
              >
                <Menu size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="header-control-button"
                onClick={() => onToggleSidebarCollapse?.()}
                aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
              >
                {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            )}
          </div>

          <div className="header-copy">
            <span className="header-eyebrow">{formatDateLabel()}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>

        <div className="header-meta">
          {isAuthenticated ? (
            <div className="header-session-badge">
              <CircleUserRound size={16} />
              <span>{operatorLogin || 'Operador autenticado'}</span>
            </div>
          ) : null}

          <div className="header-badge">
            <CalendarDays size={16} />
            <span>{formatDateTime()}</span>
          </div>

          {onDownloadReport && !isCompactLayout ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() => onDownloadReport?.()}
              disabled={downloadDisabled}
            >
              <Download size={16} />
              Baixar relatorio
            </button>
          ) : null}

          <button
            type="button"
            className={`secondary-button header-auth-button${isAuthenticated ? ' is-authenticated' : ''}`}
            onClick={() => onAuthAction?.()}
            disabled={authBusy}
          >
            {isAuthenticated ? <LogOut size={16} /> : <LogIn size={16} />}
            {authBusy ? 'Processando' : isAuthenticated ? 'Sair' : 'Login'}
          </button>

          <button
            type="button"
            className="secondary-button header-icon-button"
            onClick={() => onNotification?.()}
            aria-label="Notificacoes"
          >
            <Bell size={16} />
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => onRefresh?.()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? 'Atualizando' : 'Atualizar'}
          </button>
        </div>
      </div>
    </header>
  );
}
