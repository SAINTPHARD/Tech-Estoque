/**
 * Arquivo: src/components/dashboard/ProductTable.jsx
 * Responsabilidade: listar os produtos em formato de tabela.
 * O que voce encontra aqui: estado de loading, estado vazio e acoes de editar/excluir por linha.
 * Quando mexer: use este arquivo quando a listagem principal do inventario mudar.
 */

import DeleteButton from '../common/DeleteButton';
import EditButton from '../common/EditButton';
import { formatCurrency } from '../../utils/currencyFormatter';
import { getStockStatus } from '../../utils/productHelpers';
import './ProductTable.css';

function TableSkeleton({ showActions }) {
  // Mantem a estrutura visual da tabela enquanto os dados ainda estao carregando.
  return (
    <div className="table-shell">
      <table className="product-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preco</th>
            <th>Quantidade</th>
            <th>Status</th>
            <th>Valor total</th>
            {showActions ? <th>Acoes</th> : null}
          </tr>
        </thead>

        <tbody>
          {[1, 2, 3, 4].map((row) => (
            <tr key={row}>
              <td><span className="skeleton-line skeleton-line-lg" /></td>
              <td><span className="skeleton-line skeleton-line-md" /></td>
              <td><span className="skeleton-line skeleton-line-md" /></td>
              <td><span className="skeleton-line skeleton-line-xs" /></td>
              <td><span className="skeleton-line skeleton-line-md" /></td>
              <td><span className="skeleton-line skeleton-line-md" /></td>
              {showActions ? (
                <td>
                  <div className="table-actions">
                    <span className="skeleton-line skeleton-icon" />
                    <span className="skeleton-line skeleton-icon" />
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductTable({
  products = [],
  loading = false,
  showActions = true,
  onEdit,
  onDelete,
  deleteId,
  selectedProductId,
  emptyMessage = 'Nenhum produto encontrado.',
}) {
  if (loading) {
    return <TableSkeleton showActions={showActions} />;
  }

  if (!products.length) {
    return (
      <div className="empty-panel">
        <div className="empty-state">
          <strong>{emptyMessage}</strong>
          <p>Cadastre um produto ou ajuste os filtros para continuar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table className="product-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preco</th>
            <th>Quantidade</th>
            <th>Status</th>
            <th>Valor total</th>
            {showActions ? <th>Acoes</th> : null}
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            // Cada linha calcula seu proprio status para exibir o badge correto.
            const stockStatus = getStockStatus(product.quantidade);
            const totalValue = product.preco * product.quantidade;
            const isSelected = selectedProductId === product.id;

            return (
              <tr
                key={product.id}
                className={`table-row table-row-${stockStatus.tone}${isSelected ? ' is-selected' : ''}`}
              >
                <td>
                  <div className="product-name">
                    <strong>{product.nome}</strong>
                    <small>#{product.id}</small>
                  </div>
                </td>

                <td>{product.categoria || 'Sem categoria'}</td>
                <td>{formatCurrency(product.preco)}</td>
                <td>{product.quantidade}</td>
                <td>
                  <span className={`status-badge status-badge-${stockStatus.tone}`}>
                    {stockStatus.label}
                  </span>
                </td>
                <td>{formatCurrency(totalValue)}</td>
                {showActions ? (
                  <td>
                    <div className="table-actions">
                      <EditButton
                        onClick={() => onEdit?.(product)}
                        disabled={deleteId === product.id}
                      />

                      <DeleteButton
                        itemName={product.nome}
                        busy={deleteId === product.id}
                        onConfirm={() => onDelete?.(product)}
                      />
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
