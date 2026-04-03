/**
 * Arquivo: src/components/ProdutosDataTable.jsx
 * Responsabilidade: renderizar a tabela inteligente de produtos usada no dashboard atual.
 * O que voce encontra aqui: skeletons, filtros de status, ordenacao, tabela compacta e acoes discretas por linha.
 * Dica de manutencao: este e o arquivo certo para evoluir a listagem principal de produtos.
 */

import BotaoEditar from './BotaoEditar';
import BotaoExcluir from './BotaoExcluir';
import './ProdutosDataTable.css';
import { formatCurrency, getStockStatus, STOCK_STATUS_OPTIONS } from '../utils/produtos';

const sortOptions = [
  { id: 'recent', label: 'Mais recentes' },
  { id: 'name', label: 'Nome A-Z' },
  { id: 'stock-asc', label: 'Menor estoque' },
  { id: 'stock-desc', label: 'Maior estoque' },
  { id: 'value-desc', label: 'Maior patrimonio' },
];

function ProductsOverviewSkeleton() {
  return (
    <div className="products-overview">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overview-mini-card overview-mini-card-skeleton">
          <span className="skeleton-block skeleton-line-sm" />
          <strong className="skeleton-block skeleton-line-lg" />
        </div>
      ))}
    </div>
  );
}

function ProductsTableSkeleton() {
  return (
    <div className="products-table-shell">
      <table className="products-table products-table-skeleton">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Valor unitario</th>
            <th>Quantidade</th>
            <th>Patrimonio</th>
            <th>Status</th>
            <th>Acoes</th>
          </tr>
        </thead>

        <tbody>
          {[1, 2, 3, 4, 5].map((row) => (
            <tr key={row}>
              <td><span className="skeleton-block skeleton-line-lg" /></td>
              <td><span className="skeleton-block skeleton-line-md" /></td>
              <td><span className="skeleton-block skeleton-line-xs" /></td>
              <td><span className="skeleton-block skeleton-line-md" /></td>
              <td><span className="skeleton-block skeleton-badge" /></td>
              <td>
                <div className="product-table-actions">
                  <span className="skeleton-block skeleton-icon" />
                  <span className="skeleton-block skeleton-icon" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProdutosDataTable({
  produtos = [],
  loading = false,
  stockFilter = 'all',
  categoryFilter = 'all',
  categoryOptions = [],
  sortOption = 'recent',
  totalCount = 0,
  totalUnits = 0,
  totalPatrimonio = 0,
  onStockFilterChange,
  onCategoryFilterChange,
  onSortOptionChange,
  onStartEdit,
  onDeleteProduct,
  deleteId,
  editingProduct,
  filtersActive = false,
  onClearFilters,
}) {
  const statusOptions = STOCK_STATUS_OPTIONS;
  const resolvedCategoryOptions = [
    { id: 'all', label: 'Todas as categorias' },
    ...categoryOptions,
  ];

  if (loading) {
    return (
      <div className="products-board">
        {/* Mantem o resumo visual ativo enquanto os dados reais ainda estao chegando. */}
        <ProductsOverviewSkeleton />

        {/* Exibe linhas de tabela em formato skeleton para reduzir a sensacao de espera. */}
        <ProductsTableSkeleton />
      </div>
    );
  }

  if (!produtos.length) {
    return (
      <div className="products-board">
        <div className="empty-state">
          <strong>Nenhum produto encontrado para os filtros atuais.</strong>
          <p>Ajuste a busca ou limpe os filtros para voltar a visualizar o inventario completo.</p>

          {filtersActive ? (
            <button type="button" className="secondary-inline-button" onClick={onClearFilters}>
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="products-board">
      {/* Resume a visao atual da tabela para reforcar o contexto dos filtros ativos. */}
      <div className="products-overview">
        <div className="overview-mini-card">
          <span>Produtos exibidos</span>
          <strong>{totalCount}</strong>
        </div>

        <div className="overview-mini-card">
          <span>Unidades visiveis</span>
          <strong>{totalUnits}</strong>
        </div>

        <div className="overview-mini-card">
          <span>Patrimonio exibido</span>
          <strong>{formatCurrency(totalPatrimonio)}</strong>
        </div>
      </div>

      {/* Agrupa filtros rapidos e ordenacao para tornar a lista mais inteligente e compacta. */}
      <div className="products-toolbar">
        <div className="products-filter-group">
          {statusOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`products-filter-chip${stockFilter === option.id ? ' is-active' : ''}`}
              onClick={() => onStockFilterChange?.(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="products-toolbar-right">
          <label className="products-sort-shell" htmlFor="products-category-select">
            <span>Categoria</span>

            <select
              id="products-category-select"
              className="products-sort-select"
              value={categoryFilter}
              onChange={(event) => onCategoryFilterChange?.(event.target.value)}
            >
              {resolvedCategoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="products-sort-shell" htmlFor="products-sort-select">
            <span>Ordenar por</span>

            <select
              id="products-sort-select"
              className="products-sort-select"
              value={sortOption}
              onChange={(event) => onSortOptionChange?.(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {filtersActive ? (
            <button type="button" className="secondary-inline-button" onClick={onClearFilters}>
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>

      {/* Substitui os cards por uma tabela compacta para aproveitar melhor o espaco vertical. */}
      <div className="products-table-shell">
        <table className="products-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Valor unitario</th>
              <th>Quantidade</th>
              <th>Patrimonio</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>

          <tbody>
            {produtos.map((produto) => {
              const stockStatus = getStockStatus(produto.quantidade);
              const patrimonioProduto = produto.preco * produto.quantidade;
              const isSelected = editingProduct?.id === produto.id;

              return (
                <tr
                  key={produto.id}
                  className={`product-table-row tone-${stockStatus.tone}${isSelected ? ' is-selected' : ''}`}
                >
                  <td>
                    <div className="product-name-cell">
                      <strong>{produto.nome}</strong>

                      <div className="product-name-meta">
                        <span>#{produto.id}</span>
                        <small className="product-category-tag">
                          {produto.categoria?.trim() || 'Sem categoria'}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>{formatCurrency(produto.preco)}</td>
                  <td>{produto.quantidade}</td>
                  <td>{formatCurrency(patrimonioProduto)}</td>

                  <td>
                    <span className={`product-status-badge tone-${stockStatus.tone}`}>
                      {stockStatus.description}
                    </span>
                  </td>

                  <td>
                    <div className="product-table-actions">
                      <BotaoEditar
                        onClick={() => onStartEdit?.(produto)}
                        disabled={deleteId === produto.id}
                      />

                      <BotaoExcluir
                        itemNome={produto.nome}
                        onConfirm={() => onDeleteProduct?.(produto)}
                        busy={deleteId === produto.id}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
