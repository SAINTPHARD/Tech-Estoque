/**
 * Arquivo: src/pages/Inventory.jsx
 * Responsabilidade: reunir o fluxo completo de gestao do estoque.
 * O que voce encontra aqui: formularios, filtros, tabela e feedbacks de erro ou sucesso.
 * Quando mexer: use esta pagina quando o CRUD principal de produtos mudar.
 */

import { useMemo, useState } from 'react';
import InventoryStats from '../components/dashboard/InventoryStats';
import ProductForm from '../components/dashboard/ProductForm';
import ProductTable from '../components/dashboard/ProductTable';
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

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Edicao</span>
              <h3>{editingProduct ? `Editando #${editingProduct.id}` : 'Selecione um produto'}</h3>
              <p>
                {editingProduct
                  ? 'Atualize nome, categoria, preco e quantidade sem sair da pagina.'
                  : 'Clique em editar na tabela para carregar o formulario de atualizacao.'}
              </p>
            </div>
          </div>

          {editingProduct ? (
            <ProductForm
              initialValues={editingProduct}
              onSubmit={onUpdateProduct}
              submitLabel="Salvar alteracoes"
              busy={editBusy}
              onCancel={onCancelEdit}
            />
          ) : (
            <div className="empty-panel">
              <strong>Nenhum produto em edicao.</strong>
              <p>Quando voce selecionar um item da tabela, o formulario aparece aqui.</p>
            </div>
          )}
        </section>
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

          {hasFilters ? (
            <button type="button" className="secondary-button" onClick={clearFilters}>
              Limpar filtros
            </button>
          ) : null}
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
