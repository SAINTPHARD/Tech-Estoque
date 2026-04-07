/**
 * Arquivo: src/App.jsx
 * Responsabilidade: montar a casca principal da aplicacao.
 * O que voce encontra aqui: layout base, navegacao entre paginas, controle da sidebar e integracao com o hook de produtos.
 * Quando mexer: altere este arquivo quando a estrutura global do app mudar.
 */

import { useEffect, useState } from 'react';
import Footer from './components/layout/Footer/Footer';
import Header from './components/layout/Header/Header';
import Sidebar from './components/layout/Sidebar/Sidebar';
import useActiveSection from './hooks/useActiveSection';
import useProducts from './hooks/useProducts';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import './styles/dashboard.css';

const SIDEBAR_BREAKPOINT = 1100;

const pageMap = {
  dashboard: {
    title: 'Dashboard',
    description: 'Visao geral do estoque conectado ao backend de produtos.',
  },
  inventory: {
    title: 'Estoque',
    description: 'Cadastre, edite, exporte e acompanhe a quantidade de cada item.',
  },
  settings: {
    title: 'Configuracoes',
    description: 'Resumo tecnico da integracao, exportacao e atalhos do ambiente atual.',
  },
};

const allowedSections = Object.keys(pageMap);

function getIsCompactLayout() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth <= SIDEBAR_BREAKPOINT;
}

function resolvePageComponent(section, props) {
  // Decide qual pagina deve ser mostrada conforme a secao ativa.
  switch (section) {
    case 'inventory':
      return <Inventory {...props} />;
    case 'settings':
      return <Settings {...props} />;
    case 'dashboard':
    default:
      return <Dashboard {...props} />;
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useActiveSection('dashboard', allowedSections);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(getIsCompactLayout);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { products, loading, saving, deleteId, error, feedback, actions } = useProducts();

  useEffect(() => {
    // Mantem o layout coerente ao trocar entre desktop, tablet e mobile.
    const handleResize = () => {
      const nextCompactLayout = getIsCompactLayout();
      setIsCompactLayout(nextCompactLayout);

      if (nextCompactLayout) {
        setIsSidebarCollapsed(false);
        return;
      }

      setIsMobileSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentPage = pageMap[activeSection] ?? pageMap.dashboard;

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleSelectSection = (section) => {
    setActiveSection(section);

    if (isCompactLayout) {
      closeMobileSidebar();
    }
  };

  const handleOpenSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((currentValue) => !currentValue);
  };

  const handleLoginShortcut = () => {
    // Enquanto nao existe autentificacao real, o atalho leva para a area tecnica de acesso.
    handleSelectSection('settings');
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    handleSelectSection('inventory');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleUpdateProduct = async (payload) => {
    // A edicao usa o produto selecionado na tabela como referencia.
    if (!editingProduct) {
      return {
        ok: false,
        message: 'Selecione um produto antes de tentar editar.',
      };
    }

    const result = await actions.updateProduct(editingProduct.id, payload);

    if (result?.ok) {
      setEditingProduct(null);
    }

    return result;
  };

  const handleDeleteProduct = async (product) => {
    if (editingProduct?.id === product.id) {
      setEditingProduct(null);
    }

    return actions.deleteProduct(product);
  };

  const sharedPageProps = {
    // Este pacote evita repetir as mesmas props em cada pagina.
    products,
    loading,
    saving,
    deleteId,
    error,
    feedback,
    editingProduct,
    onCreateProduct: actions.createProduct,
    onUpdateProduct: handleUpdateProduct,
    onDeleteProduct: handleDeleteProduct,
    onStartEdit: handleStartEdit,
    onCancelEdit: handleCancelEdit,
    onRefresh: actions.refreshProducts,
    onSelectSection: handleSelectSection,
  };

  return (
    <div
      className={[
        'app-shell',
        isCompactLayout ? 'is-compact-layout' : '',
        isSidebarCollapsed && !isCompactLayout ? 'is-sidebar-collapsed' : '',
      ].filter(Boolean).join(' ')}
    >
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        isCollapsed={isSidebarCollapsed}
        isCompactLayout={isCompactLayout}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={closeMobileSidebar}
        onToggleSidebarCollapse={handleToggleSidebarCollapse}
        onLoginShortcut={handleLoginShortcut}
      />

      <div className="app-body">
        <Header
          title={currentPage.title}
          description={currentPage.description}
          productCount={products.length}
          loading={loading}
          isCompactLayout={isCompactLayout}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenSidebar={handleOpenSidebar}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
          onRefresh={actions.refreshProducts}
        />

        <main className="app-main">
          {resolvePageComponent(activeSection, sharedPageProps)}
        </main>

        <Footer />
      </div>
    </div>
  );
}
