/**
 * Arquivo: src/components/layout/Sidebar/Sidebar.jsx
 * Responsabilidade: renderizar a navegacao lateral da aplicacao.
 * O que voce encontra aqui: links das secoes principais, comportamento colapsavel e atalhos inferiores.
 * Quando mexer: altere este arquivo quando a navegacao do sistema mudar.
 */

import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LogIn,
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
  onSelectSection,
  isCollapsed = false,
  isCompactLayout = false,
  isMobileSidebarOpen = false,
  onCloseMobileSidebar,
  onToggleSidebarCollapse,
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
        {/* A sidebar concentra a troca entre paginas sem depender de um router externo. */}
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
              <p>SaaS de estoque simples</p>
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
              <span>Relatorios</span>
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
              className="sidebar-shortcut sidebar-shortcut-primary"
              onClick={() => onLoginShortcut?.()}
            >
              <LogIn size={16} />
              <span>Log in</span>
            </button>
          </div>

          <div className="sidebar-footer">
            <strong>Backend esperado</strong>
            <p>/api/produtos com nome, categoria, preco e quantidade.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
