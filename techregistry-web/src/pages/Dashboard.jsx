/**
 * Arquivo: src/pages/Dashboard.jsx
 * Responsabilidade: representar a visao geral do inventario.
 * O que voce encontra aqui: cards de resumo, grafico por categoria, importacao e uma amostra da tabela.
 * Quando mexer: altere este arquivo quando a pagina inicial do sistema mudar.
 */

import { lazy, Suspense, useRef } from 'react';
import { ArrowRight, FileUp, PackagePlus } from 'lucide-react';
import InventoryStats from '../components/dashboard/InventoryStats';
import ProductTable from '../components/dashboard/ProductTable';
import { buildInventoryStats, sortProducts } from '../utils/productHelpers';

const CategoryChart = lazy(() => import('../components/dashboard/CategoryChart'));

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

export default function Dashboard({
  products,
  loading,
  importing = false,
  isAuthenticated = false,
  onSelectSection,
  onImportProductsFile,
}) {
  const importInputRef = useRef(null);
  const stats = buildInventoryStats(products);
  const recentProducts = sortProducts(products).slice(0, 5);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleSelectImportFile = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    await onImportProductsFile?.(selectedFile);
    event.target.value = '';
  };

  return (
    <section className="page-shell">
      <div className="dashboard-alert-wrapper">
        {stats.criticalProducts > 0 ? (
          <div className="dashboard-alert">
            <strong>Atencao:</strong>
            <p>{`Existem ${stats.criticalProducts} produtos em nivel critico. Verifique o estoque urgente.`}</p>
          </div>
        ) : (
          <div className="dashboard-alert dashboard-alert-ok">
            <strong>Estoque estavel</strong>
            <p>Todos os itens estao dentro dos limites esperados no momento.</p>
          </div>
        )}
      </div>

      <div className="page-lead">
        <div>
          <span className="page-kicker">Visao executiva</span>
          <h2>Resumo rapido do inventario</h2>
          <p>Os cards mostram volume, valor e risco de ruptura em um painel unico.</p>
        </div>

        <div className="page-lead-actions">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            className="visually-hidden"
            onChange={handleSelectImportFile}
          />

          <button
            type="button"
            className="secondary-button"
            onClick={handleImportClick}
            disabled={importing}
          >
            <FileUp size={16} />
            {importing ? 'Importando' : 'Importar produtos'}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => onSelectSection?.('inventory')}
          >
            <PackagePlus size={16} />
            Adicionar produto
          </button>
        </div>
      </div>

      <InventoryStats products={products} loading={loading} />

      <div className="page-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Categorias</span>
              <h3>Distribuicao por categoria</h3>
              <p>Volume total de unidades agrupado pelo cadastro atual.</p>
            </div>
          </div>

          <Suspense fallback={<CategoryChartFallback />}>
            <CategoryChart products={products} loading={loading} />
          </Suspense>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Importacao rapida</span>
              <h3>Entrada em lote pelo dashboard</h3>
              <p>Importe um arquivo CSV ou JSON com os campos nome, categoria, preco e quantidade.</p>
            </div>
          </div>

          <div className="summary-list">
            <article className="summary-item">
              <strong>{stats.totalProducts}</strong>
              <span>produtos ja estao refletidos no painel atual.</span>
            </article>

            <article className="summary-item">
              <strong>{isAuthenticated ? 'Sessao autenticada' : 'Login necessario'}</strong>
              <span>o backend exige autenticacao para importar, criar, editar e remover.</span>
            </article>

            <article className="summary-item">
              <strong>Formato recomendado</strong>
              <span>CSV com cabecalho ou JSON com array de produtos.</span>
            </article>
          </div>

          <button
            type="button"
            className="secondary-button summary-button"
            onClick={handleImportClick}
            disabled={importing}
          >
            <FileUp size={16} />
            {importing ? 'Processando arquivo' : 'Selecionar arquivo'}
          </button>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header panel-header-inline">
          <div>
            <span className="panel-kicker">Produtos recentes</span>
            <h3>Ultimos itens cadastrados</h3>
            <p>A tabela abaixo mostra uma amostra curta do inventario.</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => onSelectSection?.('inventory')}
          >
            Abrir estoque completo
            <ArrowRight size={16} />
          </button>
        </div>

        <ProductTable
          products={recentProducts}
          loading={loading}
          showActions={false}
          emptyMessage="Nenhum produto cadastrado ainda."
        />
      </section>
    </section>
  );
}
