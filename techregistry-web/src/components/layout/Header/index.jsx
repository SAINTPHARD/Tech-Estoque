/**
 * Arquivo: src/components/layout/Header/Header.jsx
 * Responsabilidade: montar o cabecalho fixo do aplicativo.
 * O que voce encontra aqui: titulo da pagina, resumo rapido, controle da sidebar e botao de atualizacao.
 * Quando mexer: altere este arquivo se a faixa superior da aplicacao mudar.
 */

import { Bell, CalendarDays, Download, Menu, PanelLeftClose, PanelLeftOpen, RefreshCw } from 'lucide-react';
import { formatDateLabel, formatDateTime } from '../../../utils/datePicker';

export default function Header({
  title,
  description,
  loading = false,
  downloadDisabled = false,
  isCompactLayout = false,
  isSidebarCollapsed = false,
  onOpenSidebar,
  onToggleSidebarCollapse,
  onRefresh,
  onDownloadReport,
  onNotification,
}) {
  return (
    <header className="layout-header">
      {/* Resume o contexto da pagina atual e oferece acoes globais do app. */}
      <div className="header-row">
        <div className="header-leading">
          <div className="header-controls">
            {isCompactLayout ? (
              // Se o layout estiver compacto, abre a sidebar como overlay.
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
              Baixar relatório
            </button>
          ) : null}

          <button
            type="button"
            className="secondary-button header-icon-button"
            onClick={() => onNotification?.()}
            aria-label="Notificações"
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
