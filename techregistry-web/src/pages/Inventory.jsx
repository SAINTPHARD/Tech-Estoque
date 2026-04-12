/**
 * Arquivo: src/pages/Inventory.jsx
 * Responsabilidade: reunir o fluxo completo de gestao do estoque.
 * O que voce encontra aqui: formularios, filtros, tabela, feedbacks e exportacao em PDF.
 * Quando mexer: use esta pagina quando o CRUD principal de produtos mudar.
 */

import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import PdfExportMenu from '../components/common/PdfExportMenu';
import InventoryStats from '../components/dashboard/InventoryStats';
import CategoryChart from '../components/dashboard/CategoryChart';
import ProductForm from '../components/dashboard/ProductForm';
import ProductTable from '../components/dashboard/ProductTable';
import { PDF_EXPORT_OPTIONS, exportProductsPdf } from '../utils/pdfExporter';
import {
  STOCK_STATUS_OPTIONS,
  buildCategoryOptions,
  buildInventoryStats,
  filterProducts,
} from '../utils/productHelpers';

function resolveEmptyMessage(hasFilters) {
  // Troca a mensagem conforme a lista esteja vazia por falta de dados ou por causa dos filtros.
  return hasFilters
    ? 'Nenhum produto encontrado para os filtros atuais.'
    : 'Nenhum produto cadastrado ate o momento.';
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

  const categoryOptions = useMemo(() => buildCategoryOptions(products), [products]);
  const filteredProducts = useMemo(
    // A filtragem fica memorizada para evitar recalculos desnecessarios a cada render.
    () =>
      filterProducts(products, {
        searchTerm,
        categoryFilter,
        stockFilter,
      }),
    [products, searchTerm, categoryFilter, stockFilter]
  );
  const filteredStats = useMemo(
    () => buildInventoryStats(filteredProducts),
    [filteredProducts]
  );

  useEffect(() => {
    if (!exportFeedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setExportFeedback(null), 4500);
    return () => window.clearTimeout(timer);
  }, [exportFeedback]);

  const hasFilters =
    searchTerm.trim() !== '' || categoryFilter !== 'all' || stockFilter !== 'all';

  const createBusy = saving && !editingProduct;
  const editBusy = saving && Boolean(editingProduct);

  const clearFilters = () => {
    // Restaura a visao completa da tabela.
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
  };

  const handleExportPdf = (format) => {
    try {
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
            <strong>Atenção:</strong>
            <p>
              {`Existem ${filteredStats.criticalProducts} produtos em nível crítico neste recorte. Priorize reposição.`}
            </p>
          </div>
        ) : (
          <div className="dashboard-alert dashboard-alert-ok">
            <strong>Estoque saudável</strong>
            <p>O recorte atual não mostra itens críticos. Continue monitorando os filtros.</p>
          </div>
        )}
      </div>

      <div className="inventory-forms">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Novo produto</span>
              <h3>Cadastro rapido</h3>
              <p>Preencha somente os campos que existem no backend atual.</p>
            </div>
          </div>

          <ProductForm
            onSubmit={onCreateProduct}
            submitLabel="Cadastrar produto"
            busy={createBusy}
          />
        </section>

        {editingProduct ? (
          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Editar produto</span>
                <h3>{editingProduct.nome}</h3>
                <p>Atualize os dados do produto selecionado.</p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={onCancelEdit}
                disabled={editBusy}
              >
                Cancelar edição
              </button>
            </div>

            <ProductForm
              initialValues={editingProduct}
              onSubmit={onUpdateProduct}
              submitLabel="Salvar alterações"
              busy={editBusy}
              onCancel={onCancelEdit}
            />
          </section>
        ) : (
          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Visão do estoque</span>
                <h3>Distribuição de categorias</h3>
                <p>Gráfico de produtos por categoria exibido em tempo real.</p>
              </div>
            </div>

            <CategoryChart products={filteredProducts} loading={loading} />
          </section>
        )}
      </div>

      <section className="panel">
        <div className="panel-header panel-header-inline">
          <div>
            <span className="panel-kicker">Filtros</span>
            <h3>Lista de produtos</h3>
            <p>
              {filteredStats.totalProducts} produtos visiveis e {filteredStats.totalUnits} unidades
              no recorte atual.
            </p>
          </div>

          <div className="panel-header-actions">
            {hasFilters ? (
              <button type="button" className="secondary-button" onClick={clearFilters}>
                Limpar filtros
              </button>
            ) : null}

            <PdfExportMenu
              options={PDF_EXPORT_OPTIONS}
              disabled={loading || !products.length}
              onSelect={handleExportPdf}
            />
          </div>
        </div>

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
