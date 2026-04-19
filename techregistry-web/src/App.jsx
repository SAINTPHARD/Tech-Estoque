/**
 * Arquivo: src/App.jsx
 * Responsabilidade: montar a casca principal da aplicacao.
 * O que voce encontra aqui: layout base, navegacao entre paginas, login do operador e integracao com produtos.
 * Quando mexer: altere este arquivo quando a estrutura global do app mudar.
 */

import { useCallback, useEffect, useState } from 'react';
import LoginDialog from './components/common/LoginDialog';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import useActiveSection from './hooks/useActiveSection';
import useAuth from './hooks/useAuth';
import useProducts from './hooks/useProducts';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import { apiRuntimeConfig } from './services/api';
import { parseImportedProductsFile } from './utils/productImport';
import './styles/dashboard.css';

const SIDEBAR_BREAKPOINT = 1100;
const APP_NOTICE_DURATION_MS = 4500;

const pageMap = {
  dashboard: {
    title: 'Dashboard',
    description: 'Visao geral do estoque conectado ao backend de produtos.',
  },
  inventory: {
    title: 'Estoque',
    description: 'Cadastre, importe, edite e acompanhe a quantidade de cada item.',
  },
  settings: {
    title: 'Configuracoes',
    description: 'Resumo tecnico da integracao, sessao do operador e atalhos do ambiente.',
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
  const [appNotice, setAppNotice] = useState(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const {
    products,
    loading,
    saving,
    importing,
    deleteId,
    error,
    feedback,
    lastUpdated,
    actions,
  } = useProducts();
  const {
    isAuthenticated,
    operatorLogin,
    busy: authBusy,
    actions: authActions,
  } = useAuth();

  useEffect(() => {
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

  useEffect(() => {
    if (!appNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setAppNotice(null), APP_NOTICE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [appNotice]);

  useEffect(() => {
    if (!editingProduct) {
      return;
    }

    const freshProduct = products.find(
      (product) => Number(product.id) === Number(editingProduct.id),
    );

    if (!freshProduct) {
      setEditingProduct(null);
      return;
    }

    setEditingProduct(freshProduct);
  }, [products, editingProduct]);

  const currentPage = pageMap[activeSection] ?? pageMap.dashboard;

  const shouldReauthenticate = (result) => {
    const joinedMessage = [result?.message, result?.hint].filter(Boolean).join(' ').toLowerCase();
    return joinedMessage.includes('login') || joinedMessage.includes('sessao expirada');
  };

  const openLoginDialog = useCallback(() => {
    setIsLoginDialogOpen(true);
  }, []);

  const closeLoginDialog = useCallback(() => {
    setIsLoginDialogOpen(false);
  }, []);

  const showHelpCenter = () => {
    handleSelectSection('settings');
    setAppNotice({
      type: 'info',
      text: 'Central de ajuda aberta em Configuracoes.',
      hint: 'Ali voce encontra integracao da API, sessao do operador e dicas de importacao.',
    });
  };

  const ensureAuthenticated = (reason) => {
    if (isAuthenticated) {
      return true;
    }

    openLoginDialog();
    setAppNotice({
      type: 'info',
      text: `Faca login para ${reason}.`,
      hint: 'O backend libera leitura publica, mas protege criar, editar, excluir e importar.',
    });

    return false;
  };

  const handleDownloadReport = async () => {
    if (activeSection !== 'inventory' || products.length === 0) {
      return;
    }

    try {
      const { exportProductsPdf } = await import('./utils/pdfExporter');
      const fileName = exportProductsPdf({
        format: 'inventory',
        products,
        allProducts: products,
        filters: {},
      });

      setAppNotice({
        type: 'success',
        text: `Arquivo ${fileName} baixado com sucesso.`,
        hint: 'O relatorio foi gerado com os itens visiveis da tela de estoque.',
      });
    } catch (exportError) {
      console.error('Erro ao exportar PDF do cabecalho:', exportError);
      setAppNotice({
        type: 'error',
        text: 'Nao foi possivel gerar o relatorio agora.',
        hint: 'Verifique se existem dados validos e tente novamente.',
      });
    }
  };

  const handleNotificationClick = () => {
    setAppNotice({
      type: 'info',
      text: 'Nenhuma notificacao disponivel no momento.',
      hint: 'Quando existir um centro de alertas, ele sera exibido aqui.',
    });
  };

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

  const handleAuthSubmit = async (credentials) => {
    const result = await authActions.login(credentials);

    if (result?.ok) {
      closeLoginDialog();
      setAppNotice({
        type: 'success',
        text: result.message,
        hint: 'Agora o CRUD completo esta liberado para o operador autenticado.',
      });
    }

    return result;
  };

  const handleAuthAction = () => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    const result = authActions.logout();
    setEditingProduct(null);
    setAppNotice({
      type: 'info',
      text: result.message,
      hint: 'A interface continua em modo leitura para listar produtos e gerar visoes.',
    });
  };

  const handleCreateProduct = async (payload) => {
    if (!ensureAuthenticated('cadastrar produtos')) {
      return {
        ok: false,
        message: 'Faca login para cadastrar produtos no backend.',
      };
    }

    const result = await actions.createProduct(payload);

    if (!result?.ok && shouldReauthenticate(result)) {
      openLoginDialog();
    }

    return result;
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    handleSelectSection('inventory');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleUpdateProduct = async (payload) => {
    if (!ensureAuthenticated('editar produtos')) {
      return {
        ok: false,
        message: 'Faca login para editar produtos no backend.',
      };
    }

    if (!editingProduct) {
      return {
        ok: false,
        message: 'Selecione um produto antes de tentar editar.',
      };
    }

    const result = await actions.updateProduct(editingProduct.id, payload);

    if (!result?.ok && shouldReauthenticate(result)) {
      openLoginDialog();
    }

    if (result?.ok) {
      setEditingProduct(null);
    }

    return result;
  };

  const handleDeleteProduct = async (product) => {
    if (!ensureAuthenticated('remover produtos')) {
      return {
        ok: false,
        message: 'Faca login para remover produtos do backend.',
      };
    }

    if (editingProduct?.id === product.id) {
      setEditingProduct(null);
    }

    const result = await actions.deleteProduct(product);

    if (!result?.ok && shouldReauthenticate(result)) {
      openLoginDialog();
    }

    return result;
  };

  const handleImportProductsFile = async (file) => {
    if (!ensureAuthenticated('importar produtos')) {
      return;
    }

    try {
      const parsedFile = await parseImportedProductsFile(file);
      const result = await actions.importProducts(parsedFile.products);
      const skippedMessage = parsedFile.skippedCount
        ? ` ${parsedFile.skippedCount} linha(s) foram ignoradas por dados invalidos.`
        : '';

      if (!result?.ok && shouldReauthenticate(result)) {
        openLoginDialog();
      }

      setAppNotice({
        type: result?.partial ? 'info' : result?.ok ? 'success' : 'error',
        text: result?.message || 'Importacao concluida.',
        hint: `Arquivo: ${parsedFile.sourceName}.${skippedMessage}${result?.hint ? ` ${result.hint}` : ''}`,
      });
    } catch (importError) {
      console.error('Erro ao importar produtos:', importError);
      setAppNotice({
        type: 'error',
        text: 'Nao foi possivel importar os produtos.',
        hint: importError?.message || 'Revise o arquivo e tente novamente com CSV ou JSON valido.',
      });
    }
  };

  const sharedPageProps = {
    products,
    loading,
    saving,
    importing,
    deleteId,
    error,
    feedback,
    lastUpdated,
    editingProduct,
    isAuthenticated,
    operatorLogin,
    onCreateProduct: handleCreateProduct,
    onUpdateProduct: handleUpdateProduct,
    onDeleteProduct: handleDeleteProduct,
    onStartEdit: handleStartEdit,
    onCancelEdit: handleCancelEdit,
    onRefresh: actions.refreshProducts,
    onSelectSection: handleSelectSection,
    onImportProductsFile: handleImportProductsFile,
    onOpenLogin: openLoginDialog,
    onOpenHelp: showHelpCenter,
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
        isAuthenticated={isAuthenticated}
        onSelectSection={handleSelectSection}
        isCollapsed={isSidebarCollapsed}
        isCompactLayout={isCompactLayout}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={closeMobileSidebar}
        onToggleSidebarCollapse={handleToggleSidebarCollapse}
        onHelpShortcut={showHelpCenter}
        onLoginShortcut={handleAuthAction}
      />

      <div className="app-body">
        <Header
          title={currentPage.title}
          description={currentPage.description}
          loading={loading}
          downloadDisabled={loading || products.length === 0}
          isCompactLayout={isCompactLayout}
          isSidebarCollapsed={isSidebarCollapsed}
          isAuthenticated={isAuthenticated}
          operatorLogin={operatorLogin}
          authBusy={authBusy}
          onOpenSidebar={handleOpenSidebar}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
          onRefresh={actions.refreshProducts}
          onDownloadReport={activeSection === 'inventory' ? handleDownloadReport : undefined}
          onNotification={handleNotificationClick}
          onAuthAction={handleAuthAction}
        />

        <main className="app-main">
          {appNotice ? (
            <div className={`notice notice-${appNotice.type}`}>
              <div>
                <strong>{appNotice.text}</strong>
                {appNotice.hint ? <p>{appNotice.hint}</p> : null}
              </div>
            </div>
          ) : null}

          {resolvePageComponent(activeSection, sharedPageProps)}
        </main>

        <Footer
          productCount={products.length}
          apiBaseUrl={apiRuntimeConfig.baseURL}
          lastUpdated={lastUpdated}
          isAuthenticated={isAuthenticated}
          operatorLogin={operatorLogin}
          onHelp={showHelpCenter}
          onAuthAction={handleAuthAction}
          onOpenSettings={() => handleSelectSection('settings')}
        />
      </div>

      <LoginDialog
        isOpen={isLoginDialogOpen}
        busy={authBusy}
        initialLogin={operatorLogin}
        onClose={closeLoginDialog}
        onSubmit={handleAuthSubmit}
      />
    </div>
  );
}
