/**
 * Arquivo: src/pages/Inventory.jsx
 * Responsabilidade: reunir o fluxo completo de gestao do estoque.
 * O que voce encontra aqui: formulario de cadastro, filtros, tabela, edicao inline e exportacao em PDF.
 * Quando mexer: use esta pagina quando o CRUD principal de produtos mudar.
 */

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { PackagePlus } from 'lucide-react';
import PdfExportMenu from '../components/common/PdfExportMenu';
import InventoryStats from '../components/dashboard/InventoryStats';
import ProductForm from '../components/dashboard/ProductForm';
import ProductTable from '../components/dashboard/ProductTable';
import { PDF_EXPORT_OPTIONS } from '../utils/pdfExportConfig';
import {
  STOCK_STATUS_OPTIONS,
  buildCategoryOptions,
  buildInventoryStats,
  filterProducts,
} from '../utils/productHelpers';

const CategoryChart = lazy(() => import('../components/dashboard/CategoryChart'));

function resolveEmptyMessage(hasFilters) {
  return hasFilters
    ? 'Nenhum produto encontrado para os filtros atuais.'
    : 'Nenhum produto cadastrado ate o momento.';
}

function CategoryChartFallback() {
  return (
    <div className="category-chart-shell">
      <div className="category-chart-placeholder">
        <span className="skeleton-line skeleton-line-sm" />
        <span className="skeleton-line skeleton-line-lg" />
        <span className="skeleton-line skeleton-line-md" />
      </div>
    </div>
  );
}

export default function Inventory({
  products,
  loading,
  saving,
  deleteId,
  error,
  feedback,
  editingProduct,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onStartEdit,
  onCancelEdit,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [exportFeedback, setExportFeedback] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const createPanelRef = useRef(null);
  const editPanelRef = useRef(null);

  const categoryOptions = useMemo(() => buildCategoryOptions(products), [products]);
  const filteredProducts = useMemo(
    () =>
      filterProducts(products, {
        searchTerm,
        categoryFilter,
        stockFilter,
      }),
    [products, searchTerm, categoryFilter, stockFilter],
  );
  const filteredStats = useMemo(() => buildInventoryStats(filteredProducts), [filteredProducts]);

  useEffect(() => {
    if (!exportFeedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setExportFeedback(null), 4500);
    return () => window.clearTimeout(timer);
  }, [exportFeedback]);

  useEffect(() => {
    if (!editingProduct) {
      return;
    }

    editPanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [editingProduct]);

  const hasFilters =
    searchTerm.trim() !== '' || categoryFilter !== 'all' || stockFilter !== 'all';

  const createBusy = saving && !editingProduct;
  const editBusy = saving && Boolean(editingProduct);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
  };

  const handleGoToCreateProduct = () => {
    onCancelEdit?.();

    createPanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleExportPdf = async (format) => {
    setIsExporting(true);

    try {
      const { exportProductsPdf } = await import('../utils/pdfExporter');
      const fileName = exportProductsPdf({
        format,
        products: filteredProducts,
        allProducts: products,
        filters: {
          searchTerm,
          categoryFilter,
          stockFilter,
        },
      });

      setExportFeedback({
        type: 'success',
        text: `Arquivo ${fileName} baixado com sucesso.`,
        hint: 'Formatos disponiveis: resumo executivo, inventario atual e reposicao urgente.',
      });
    } catch (exportError) {
      console.error('Erro ao exportar PDF:', exportError);
      setExportFeedback({
        type: 'error',
        text: 'Nao foi possivel gerar o PDF agora.',
        hint: 'Verifique se existem dados validos e tente novamente.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="page-shell">
      {error ? (
        <div className="notice notice-error">
          <div>
            <strong>{error.message}</strong>
            {error.hint ? <p>{error.hint}</p> : null}
          </div>

          <button type="button" className="secondary-button" onClick={() => onRefresh?.()}>
            Tentar novamente
          </button>
        </div>
      ) : null}

      {feedback ? (
        <div className={`notice notice-${feedback.type}`}>
          <div>
            <strong>{feedback.text}</strong>
            {feedback.hint ? <p>{feedback.hint}</p> : null}
          </div>
        </div>
      ) : null}

      {exportFeedback ? (
        <div className={`notice notice-${exportFeedback.type}`}>
          <div>
            <strong>{exportFeedback.text}</strong>
            {exportFeedback.hint ? <p>{exportFeedback.hint}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="dashboard-alert-wrapper">
        {filteredStats.criticalProducts > 0 ? (
          <div className="dashboard-alert">
            <strong>Atencao:</strong>
            <p>
              {`Existem ${filteredStats.criticalProducts} produtos em nivel critico neste recorte. Priorize reposicao.`}
            </p>
          </div>
        ) : (
          <div className="dashboard-alert dashboard-alert-ok">
            <strong>Estoque saudavel</strong>
            <p>O recorte atual nao mostra itens criticos. Continue monitorando os filtros.</p>
          </div>
        )}
      </div>

      <div className="inventory-forms">
        <section ref={createPanelRef} className="panel" id="inventory-create-panel">
          <div className="panel-header panel-header-inline">
            <div>
              <span className="panel-kicker">Novo produto</span>
              <h3>Cadastro rapido</h3>
              <p>Adicione produtos individualmente e sincronize na hora com o backend.</p>
            </div>
          </div>

          <ProductForm
            onSubmit={onCreateProduct}
            submitLabel="Adicionar produto"
            busy={createBusy}
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Visao do estoque</span>
              <h3>Distribuicao de categorias</h3>
              <p>Grafico de produtos por categoria exibido em tempo real.</p>
            </div>
          </div>

          <Suspense fallback={<CategoryChartFallback />}>
            <CategoryChart products={filteredProducts} loading={loading} />
          </Suspense>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header panel-header-inline">
          <div>
            <span className="panel-kicker">Produtos cadastrados</span>
            <h3>Lista de produtos</h3>
            <p>
              {filteredStats.totalProducts} produtos visiveis e {filteredStats.totalUnits} unidades
              no recorte atual.
            </p>
          </div>

          <div className="panel-header-actions">
            <button type="button" className="primary-button" onClick={handleGoToCreateProduct}>
              <PackagePlus size={16} />
              Adicionar produto
            </button>

            {hasFilters ? (
              <button type="button" className="secondary-button" onClick={clearFilters}>
                Limpar filtros
              </button>
            ) : null}

            <PdfExportMenu
              options={PDF_EXPORT_OPTIONS}
              disabled={loading || isExporting || !products.length}
              onSelect={handleExportPdf}
            />
          </div>
        </div>

        {editingProduct ? (
          <div ref={editPanelRef} className="inline-editor-shell">
            <div className="inline-editor-header">
              <div>
                <span className="panel-kicker">Editar no mesmo bloco</span>
                <h3>{editingProduct.nome}</h3>
                <p>As alteracoes aparecem na tabela assim que a API confirmar a atualizacao.</p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={onCancelEdit}
                disabled={editBusy}
              >
                Cancelar edicao
              </button>
            </div>

            <ProductForm
              initialValues={editingProduct}
              onSubmit={onUpdateProduct}
              submitLabel="Salvar alteracoes"
              busy={editBusy}
              onCancel={onCancelEdit}
            />
          </div>
        ) : null}

        <div className="inventory-toolbar">
          <label className="field-shell">
            <span>Buscar por nome</span>
            <input
              className="text-filter"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ex.: notebook, mouse, teclado"
            />
          </label>

          <label className="field-shell">
            <span>Categoria</span>
            <select
              className="select-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">Todas as categorias</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-chip-group">
          {STOCK_STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`filter-chip${stockFilter === option.id ? ' is-active' : ''}`}
              onClick={() => setStockFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <InventoryStats products={filteredProducts} loading={loading} />

        <ProductTable
          products={filteredProducts}
          loading={loading}
          onEdit={onStartEdit}
          onDelete={onDeleteProduct}
          deleteId={deleteId}
          selectedProductId={editingProduct?.id}
          emptyMessage={resolveEmptyMessage(hasFilters)}
        />
      </section>
    </section>
  );
}
