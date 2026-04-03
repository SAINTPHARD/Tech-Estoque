/**
 * Arquivo: src/components/layout/Sidebar.jsx
 * Responsabilidade: controlar o drawer lateral do dashboard e sua navegacao interna.
 * O que voce encontra aqui: abertura e fechamento do menu, destaque da secao ativa e bloco de login no rodape.
 * Dica de manutencao: este arquivo concentra a experiencia do menu lateral do produto.
 */

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogIn,
  PackagePlus,
  X,
} from 'lucide-react';
import './Sidebar.css';
import SidebarItem from './SidebarItem';

const navigationItems = [
  {
    id: 'dashboard-top',
    label: 'Visão Geral',
    icon: LayoutDashboard,
  },
  {
    id: 'dashboard-cadastro',
    label: 'Cadastro',
    icon: PackagePlus,
  },
  {
    id: 'dashboard-produtos',
    label: 'Produtos',
    icon: Boxes,
  },
  {
    id: 'dashboard-estoque',
    label: 'Estoque',
    icon: BarChart3,
  },
];

export default function Sidebar({ isOpen = false, onClose }) {
  const [activeSection, setActiveSection] = useState(navigationItems[0].id);

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 180;
      let currentSection = navigationItems[0].id;

      navigationItems.forEach((item) => {
        const section = document.getElementById(item.id);

        if (section && section.offsetTop <= scrollPosition) {
          currentSection = item.id;
        }
      });

      setActiveSection(currentSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });

    return () => window.removeEventListener('scroll', updateActiveSection);
  }, []);

  // Permite fechar o drawer pelo teclado para manter a navegacao mais fluida.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fecha o drawer depois da navegacao para devolver o foco ao conteudo principal.
  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    onClose?.();
  };

  return (
    <>
      {/* Cria a camada de fundo que fecha o menu quando o usuario clica fora dele. */}
      <button
        type="button"
        className={`sidebar-backdrop${isOpen ? ' is-visible' : ''}`}
        aria-label="Fechar menu lateral"
        aria-hidden={!isOpen}
        onClick={() => onClose?.()}
      />

      {/* Mantem o menu lateral como drawer deslizante, aberto apenas quando solicitado. */}
      <aside
        id="app-sidebar"
        className={`sidebar${isOpen ? ' is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="sidebar-inner">
          {/* Deixa o fechamento do drawer acessivel sem competir com o restante do menu. */}
          <div className="sidebar-topbar">
            <button
              type="button"
              className="sidebar-close"
              onClick={() => onClose?.()}
              aria-label="Fechar menu lateral"
            >
              <X size={18} />
            </button>
          </div>

          {/* Simplifica o topo do menu para ficar mais proximo do exemplo enviado. */}
          <div className="sidebar-brand">
            <h2>Dashboard</h2>
            <p>TechRegistry SaaS</p>
          </div>

          {/* Agrupa os atalhos principais sob um bloco unico, como no menu de referencia. */}
          <div className="sidebar-section">
            <span className="sidebar-menu-title">Menu</span>

            <nav className="sidebar-menu" aria-label="Navegacao do painel">
              {navigationItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onSelect={handleNavigate}
                />
              ))}
            </nav>
          </div>

          <div className="sidebar-spacer" />

          {/* Reserva o rodape para a acao de acesso, como no print de referencia. */}
          <div className="sidebar-section sidebar-section-general">
            <span className="sidebar-menu-title">General</span>

            <div className="sidebar-login-card">
              <div className="sidebar-login-avatar">TR</div>

              <div className="sidebar-login-copy">
                <strong>Login</strong>
                <span>Acesse sua conta</span>
              </div>
            </div>

            <button type="button" className="sidebar-login-button">
              <LogIn size={18} />
              <span>Entrar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
