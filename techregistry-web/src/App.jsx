/**
 * Arquivo: src/App.jsx
 * Responsabilidade: orquestrar o dashboard principal e integrar todos os componentes da tela.
 * O que voce encontra aqui: carregamento do backend, busca, filtros, feedbacks, edicao, exclusao, exportacao e composicao do layout.
 * Dica de manutencao: altere este arquivo quando a regra envolver mais de um componente do dashboard ao mesmo tempo.
 */
import { useEffect, useState } from 'react';
import './App.css';

import api, { buildApiErrorFeedback } from './lib/api';
import Sidebar from './components/layout/Sidebar';
import ProdutoForm from './components/ProdutoForm';
import DashboardEstoque from './components/DashboardEstoque';
import CardsResumo from './components/CardsResumo';
import BotaoRelatorio from './components/BotaoRelatorio';
import ProdutosDataTable from './components/ProdutosDataTable';
import { LayoutDashboard, Menu, PackagePlus, Search, X } from 'lucide-react';
import { formatCurrency, getStockStatus, normalizeProduct, sortProducts, sortProductsBy } from './utils/produtos';

const API_URL = "/produtos";
const EMPTY_CATEGORY_FILTER = '__sem_categoria__';

function normalizeCategoryValue(value = '') {
  return value.trim().toLowerCase();
}

function App() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [searchText, setSearchText] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');

  const normalizedFilter = filtro.trim().toLowerCase();
  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(normalizedFilter)
  );
  const categoryMap = new Map();
  let hasProductsWithoutCategory = false;

  produtos.forEach((produto) => {
    const categoryLabel = produto.categoria?.trim() || '';

    if (!categoryLabel) {
      hasProductsWithoutCategory = true;
      return;
    }

    const categoryId = normalizeCategoryValue(categoryLabel);

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, categoryLabel);
    }
  });

  const categoryOptions = [...categoryMap.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((optionA, optionB) => optionA.label.localeCompare(optionB.label, 'pt-BR'));

  if (hasProductsWithoutCategory) {
    categoryOptions.push({
      id: EMPTY_CATEGORY_FILTER,
      label: 'Sem categoria',
    });
  }

  const dadosPesquisados = normalizedFilter ? produtosFiltrados : produtos;
  const dadosFiltradosPorCategoria =
    categoryFilter === 'all'
      ? dadosPesquisados
      : dadosPesquisados.filter((produto) => {
          const normalizedCategory = normalizeCategoryValue(produto.categoria || '');

          if (categoryFilter === EMPTY_CATEGORY_FILTER) {
            return !normalizedCategory;
          }

          return normalizedCategory === categoryFilter;
        });
  const dadosFiltradosPorStatus =
    stockFilter === 'all'
      ? dadosFiltradosPorCategoria
      : dadosFiltradosPorCategoria.filter((produto) => getStockStatus(produto.quantidade).id === stockFilter);
  const dadosExibidos = sortProductsBy(dadosFiltradosPorStatus, sortOption);
  const itensEmAtencao = dadosExibidos.filter((produto) => produto.quantidade < 20).length;
  const patrimonioExibido = dadosExibidos.reduce(
    (accumulator, produto) => accumulator + produto.preco * produto.quantidade,
    0
  );
  const unidadesExibidas = dadosExibidos.reduce(
    (accumulator, produto) => accumulator + produto.quantidade,
    0
  );
  const filtrosAtivos = Boolean(normalizedFilter || stockFilter !== 'all' || categoryFilter !== 'all');

  const upsertProduct = (savedProduct) => {
    if (!savedProduct || typeof savedProduct !== 'object' || savedProduct.id == null) {
      return false;
    }

    const normalizedProduct = normalizeProduct(savedProduct);

    setProdutos((currentProducts) => {
      const hasExistingProduct = currentProducts.some((currentProduct) => currentProduct.id === normalizedProduct.id);
      const nextProducts = hasExistingProduct
        ? currentProducts.map((currentProduct) =>
            currentProduct.id === normalizedProduct.id ? normalizedProduct : currentProduct
          )
        : [...currentProducts, normalizedProduct];

      return sortProducts(nextProducts);
    });

    return true;
  };

  const carregarProdutos = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const { data } = await api.get(API_URL);
      setProdutos(sortProducts(Array.isArray(data) ? data : []));
      setLoadError(null);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setLoadError(buildApiErrorFeedback(error, API_URL));
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!editingProduct) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !formBusy) {
        setEditingProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingProduct, formBusy]);

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;
    setSearchText(nextValue);
    setFiltro(nextValue.trim());
  };

  const handleStockFilterChange = (nextFilter) => {
    setStockFilter(nextFilter);
  };

  const handleClearAllFilters = () => {
    setFiltro('');
    setSearchText('');
    setStockFilter('all');
    setCategoryFilter('all');
    setSortOption('recent');
  };

  const handleStartEdit = (produto) => {
    setEditingProduct(produto);
    setFeedback(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const salvarProduto = async (payload, produtoAlvo = null) => {
    setFormBusy(true);
    setFeedback(null);

    try {
      if (produtoAlvo) {
        const { data } = await api.put(`${API_URL}/${produtoAlvo.id}`, payload);
        const productToStore = {
          ...data,
          categoria: data?.categoria ?? payload.categoria ?? produtoAlvo?.categoria ?? '',
        };

        if (!upsertProduct(productToStore)) {
          await carregarProdutos(false);
        }

        const successFeedback = {
          type: 'success',
          text: `As informacoes de "${payload.nome}" foram atualizadas.`,
        };

        setLoadError(null);
        setFeedback(successFeedback);
        setEditingProduct(null);

        return {
          ok: true,
          message: successFeedback.text,
        };
      } else {
        const { data } = await api.post(API_URL, payload);
        const productToStore = {
          ...data,
          categoria: data?.categoria ?? payload.categoria ?? '',
        };

        if (!upsertProduct(productToStore)) {
          await carregarProdutos(false);
        }

        setFiltro('');
        setSearchText('');
        setStockFilter('all');
        setCategoryFilter('all');
        setSortOption('recent');

        const successFeedback = {
          type: 'success',
          text: `Produto "${payload.nome}" cadastrado com sucesso.`,
          hint: 'A lista de produtos atuais foi atualizada automaticamente.',
        };

        setLoadError(null);
        setFeedback(successFeedback);

        return {
          ok: true,
          message: successFeedback.text,
          hint: successFeedback.hint,
        };
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);

      const apiFeedback = buildApiErrorFeedback(error, API_URL);
      const errorFeedback = {
        type: 'error',
        text: apiFeedback.message,
        hint: apiFeedback.hint,
      };

      setFeedback(errorFeedback);

      return {
        ok: false,
        message: errorFeedback.text,
        hint: errorFeedback.hint,
      };
    } finally {
      setFormBusy(false);
    }
  };

  const handleCreateProduct = (payload) => salvarProduto(payload);

  const handleSaveEditedProduct = (payload) => {
    if (!editingProduct) {
      return {
        ok: false,
        message: 'Nenhum produto foi selecionado para edicao.',
      };
    }

    return salvarProduto(payload, editingProduct);
  };

  const handleDeleteProduct = async (produto) => {
    setDeleteId(produto.id);
    setFeedback(null);

    try {
      await api.delete(`${API_URL}/${produto.id}`);
      setProdutos((currentProducts) =>
        currentProducts.filter((currentProduct) => currentProduct.id !== produto.id)
      );
      setEditingProduct((currentProduct) =>
        currentProduct?.id === produto.id ? null : currentProduct
      );
      setFeedback({
        type: 'success',
        text: `"${produto.nome}" foi removido do inventario.`,
      });
      return true;
    } catch (error) {
      console.error('Erro ao excluir produto:', error);

      const apiFeedback = buildApiErrorFeedback(error, `${API_URL}/${produto.id}`);
      setFeedback({
        type: 'error',
        text: apiFeedback.message,
        hint: apiFeedback.hint,
      });
      return false;
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="main-content">
        <header id="dashboard-top" className="dashboard-header dashboard-section-anchor">
          <div className="dashboard-header-content">
            <div className="dashboard-header-leading">
              <button
                type="button"
                className="sidebar-toggle"
                aria-label="Abrir menu lateral"
                title="Abrir menu lateral"
                aria-controls="app-sidebar"
                aria-expanded={isSidebarOpen}
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>

              <div className="dashboard-brand">
                <h1 className="dashboard-title">
                  <span className="dashboard-title-icon">
                    <LayoutDashboard color="#2563eb" size={20} />
                  </span>
                  TechRegistry SaaS
                </h1>
                <small>Controle de inventario</small>
              </div>
            </div>

            <div className="header-search-block">
              <label className="header-search-shell" htmlFor="header-search-input">
                <span className="header-search-icon">
                  <Search size={18} />
                </span>

                <input
                  id="header-search-input"
                  className="header-search-input"
                  type="text"
                  placeholder="Pesquisar produtos"
                  value={searchText}
                  onChange={handleSearchChange}
                />

                {searchText ? (
                  <button
                    type="button"
                    className="header-search-clear"
                    onClick={() => {
                      setSearchText('');
                      setFiltro('');
                    }}
                    aria-label="Limpar busca"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </label>
            </div>

            <div className="dashboard-actions">
              <BotaoRelatorio dados={dadosExibidos} disabled={!dadosExibidos.length} />
            </div>
          </div>
        </header>

        <main className="dashboard-container">
          {loadError ? (
            <div className="dashboard-notice error">
              <div className="dashboard-notice-content">
                <strong>Falha ao sincronizar o painel.</strong>
                <span>{loadError.message}</span>
                {loadError.hint ? <small className="dashboard-notice-hint">{loadError.hint}</small> : null}
              </div>
              <button type="button" className="secondary-inline-button" onClick={() => carregarProdutos()}>
                Tentar novamente
              </button>
            </div>
          ) : null}

          {feedback ? (
            <div className={`dashboard-notice ${feedback.type}`}>
              <div className="dashboard-notice-content">
                <strong>{feedback.type === 'success' ? 'Tudo certo.' : 'Algo deu errado.'}</strong>
                <span>{feedback.text}</span>
                {feedback.hint ? <small className="dashboard-notice-hint">{feedback.hint}</small> : null}
              </div>
            </div>
          ) : null}

          <section className="dashboard-section-anchor">
            <CardsResumo dados={dadosExibidos} filtroAtivo={filtrosAtivos} loading={loading} />
          </section>

          <div className="main-grid">
            <div className="left-column">
              <div id="dashboard-cadastro" className="card-panel dashboard-section-anchor form-panel">
                <div className="section-header-row">
                  <div>
                    <h3 className="section-title">
                      <PackagePlus size={20} color="#22c55e" />
                      Novo lancamento
                    </h3>
                    <p className="section-description">
                      Cadastre um produto com nome, categoria, preco e quantidade para alimentar o painel.
                    </p>
                  </div>

                  {editingProduct ? (
                    <span className="summary-pill">Edicao ativa</span>
                  ) : null}
                </div>

                <ProdutoForm
                  initialValues={null}
                  onSubmit={handleCreateProduct}
                  busy={formBusy}
                  submitLabel="Cadastrar produto"
                />
              </div>

              <div id="dashboard-produtos" className="card-panel dashboard-section-anchor">
                <div className="section-header-row">
                  <div>
                    <h3 className="section-title section-title-plain">Produtos atuais</h3>
                    <p className="section-description">
                      {loading
                        ? 'Atualizando o painel de produtos.'
                        : 'Acompanhe o inventario em tabela com filtros, ordenacao e acoes discretas.'}
                    </p>
                  </div>

                  <div className="table-summary">
                    <span className="summary-pill">
                      {itensEmAtencao} item{itensEmAtencao === 1 ? '' : 's'} em atencao
                    </span>

                    {filtrosAtivos ? (
                      <button
                        type="button"
                        className="secondary-inline-button"
                        onClick={handleClearAllFilters}
                      >
                        Limpar filtro
                      </button>
                    ) : null}
                  </div>
                </div>

                <ProdutosDataTable
                  produtos={dadosExibidos}
                  loading={loading}
                  stockFilter={stockFilter}
                  categoryFilter={categoryFilter}
                  categoryOptions={categoryOptions}
                  sortOption={sortOption}
                  totalCount={dadosExibidos.length}
                  totalUnits={unidadesExibidas}
                  totalPatrimonio={patrimonioExibido}
                  onStockFilterChange={handleStockFilterChange}
                  onCategoryFilterChange={setCategoryFilter}
                  onSortOptionChange={setSortOption}
                  onStartEdit={handleStartEdit}
                  onDeleteProduct={handleDeleteProduct}
                  deleteId={deleteId}
                  editingProduct={editingProduct}
                  filtersActive={filtrosAtivos}
                  onClearFilters={handleClearAllFilters}
                />
              </div>
            </div>

            <aside className="right-column">
              <div id="dashboard-estoque" className="card-panel dashboard-section-anchor chart-card">
                <DashboardEstoque
                  dados={dadosFiltradosPorCategoria}
                  loading={loading}
                  activeStatus={stockFilter}
                  onSelectStatus={handleStockFilterChange}
                />
              </div>
            </aside>
          </div>
        </main>
      </div>

      {editingProduct ? (
        <div
          className="edit-drawer-backdrop"
          onClick={() => {
            if (!formBusy) {
              handleCancelEdit();
            }
          }}
        >
          <aside
            className="edit-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="edit-drawer-header">
              <div>
                <span className="edit-drawer-kicker">Modo edicao</span>
                <h2 id="edit-drawer-title">Editar produto</h2>
                <p>Atualize os dados do item selecionado sem baguncar o restante do painel.</p>
              </div>

              <button
                type="button"
                className="edit-drawer-close"
                onClick={handleCancelEdit}
                disabled={formBusy}
                aria-label="Fechar edicao"
              >
                <X size={18} />
              </button>
            </div>

            <div className="edit-drawer-highlight">
              <strong>{editingProduct.nome}</strong>

              <div className="edit-drawer-meta">
                <span>ID #{editingProduct.id}</span>
                <span>{formatCurrency(editingProduct.preco)}</span>
                <span>{editingProduct.quantidade} unidades</span>
              </div>
            </div>

            <div className="edit-drawer-body">
              <ProdutoForm
                initialValues={editingProduct}
                onSubmit={handleSaveEditedProduct}
                busy={formBusy}
                submitLabel="Salvar alteracoes"
              />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default App;
