/**
 * Arquivo: src/components/layout/Sidebar/Sidebar.jsx
 * Responsabilidade: renderizar a navegacao lateral da aplicacao.
 * O que voce encontra aqui: links das secoes principais e um resumo do backend esperado.
 * Quando mexer: altere este arquivo quando a navegacao do sistema mudar.
 */

import { Boxes, LayoutDashboard, Settings2 } from 'lucide-react';
import './Sidebar.css';

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

export default function Sidebar({ activeSection = 'dashboard', onSelectSection }) {
  return (
    <aside className="sidebar-shell">
      {/* A sidebar concentra a troca entre paginas sem depender de um router externo. */}
      <div className="sidebar-card">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">TR</span>
          <div>
            <strong>TechRegistry</strong>
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

        <div className="sidebar-footer">
          <strong>Backend esperado</strong>
          <p>`/api/produtos` com nome, categoria, preco e quantidade.</p>
        </div>
      </div>
    </aside>
  );
}
