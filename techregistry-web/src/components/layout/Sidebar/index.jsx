/**
 * Arquivo: src/components/layout/Sidebar/index.jsx
 * Responsabilidade: renderizar a navegacao lateral da aplicacao.
 * O que voce encontra aqui: links das secoes principais, atalhos, ajuda e controle da sessao.
 * Quando mexer: altere este arquivo quando a navegacao do sistema mudar.
 */

import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronLeft,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings2,
  X,
} from 'lucide-react';
import './style.css';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Visao geral',
    icon: LayoutDashboard,
  },
  {
    id: 'inventory',
    label: 'Estoque',
    description: 'Cadastro e edicao',
    icon: Boxes,
  },
  {
    id: 'settings',
    label: 'Configuracoes',
    description: 'Integracao e ambiente',
    icon: Settings2,
  },
];

export default function Sidebar({
  activeSection = 'dashboard',
  isAuthenticated = false,
  onSelectSection,
  isCollapsed = false,
  isCompactLayout = false,
  isMobileSidebarOpen = false,
  onCloseMobileSidebar,
  onToggleSidebarCollapse,
  onHelpShortcut,
  onLoginShortcut,
}) {
  const shellClassName = [
    'sidebar-shell',
    isCollapsed && !isCompactLayout ? 'is-collapsed' : '',
    isCompactLayout ? 'is-compact' : '',
    isMobileSidebarOpen ? 'is-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {isCompactLayout && isMobileSidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => onCloseMobileSidebar?.()}
          aria-label="Fechar menu lateral"
        />
      ) : null}

      <aside className={shellClassName} aria-hidden={isCompactLayout && !isMobileSidebarOpen}>
        <div className="sidebar-card">
          <div className="sidebar-topbar">
            <button
              type="button"
              className={`sidebar-control${isCollapsed && !isCompactLayout ? ' is-collapsed' : ''}`}
              onClick={() => {
                if (isCompactLayout) {
                  onCloseMobileSidebar?.();
                  return;
                }

                onToggleSidebarCollapse?.();
              }}
              aria-label={isCompactLayout ? 'Fechar menu lateral' : 'Alternar menu lateral'}
            >
              {isCompactLayout ? <X size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <div className="sidebar-brand">
            <span className="sidebar-brand-mark">TR</span>

            <div className="sidebar-brand-copy">
              <strong>Tech Estoque</strong>
              <p>Painel operacional conectado ao backend</p>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Navegacao principal">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-link${activeSection === item.id ? ' is-active' : ''}`}
                  onClick={() => onSelectSection?.(item.id)}
                >
                  <span className="sidebar-link-icon">
                    <Icon size={18} />
                  </span>

                  <span className="sidebar-link-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-insights">
            <span className="sidebar-shortcuts-title">Painel rapido</span>

            <button
              type="button"
              className="sidebar-insight"
              onClick={() => onSelectSection?.('dashboard')}
            >
              <BarChart3 size={16} />
              <span>Indicadores</span>
            </button>

            <button
              type="button"
              className="sidebar-insight"
              onClick={() => onSelectSection?.('inventory')}
            >
              <FileText size={16} />
              <span>Produtos cadastrados</span>
            </button>

            <button
              type="button"
              className="sidebar-insight"
              onClick={() => onSelectSection?.('inventory')}
            >
              <AlertTriangle size={16} />
              <span>Itens criticos</span>
            </button>
          </div>

          <div className="sidebar-shortcuts">
            <span className="sidebar-shortcuts-title">Atalhos rapidos</span>

            <button
              type="button"
              className="sidebar-shortcut"
              onClick={() => onSelectSection?.('settings')}
            >
              <Settings2 size={16} />
              <span>Configuracoes</span>
            </button>

            <button
              type="button"
              className="sidebar-shortcut"
              onClick={() => onHelpShortcut?.()}
            >
              <CircleHelp size={16} />
              <span>Ajuda</span>
            </button>

            <button
              type="button"
              className="sidebar-shortcut sidebar-shortcut-primary"
              onClick={() => onLoginShortcut?.()}
            >
              {isAuthenticated ? <LogOut size={16} /> : <LogIn size={16} />}
              <span>{isAuthenticated ? 'Sair' : 'Log in'}</span>
            </button>
          </div>

          <div className="sidebar-footer">
            <strong>CRUD protegido</strong>
            <p>GET de produtos e publico. Criacao, edicao e exclusao exigem login valido.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
