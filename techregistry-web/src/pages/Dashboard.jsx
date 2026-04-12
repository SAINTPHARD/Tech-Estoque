/**
 * Arquivo: src/pages/Dashboard.jsx
 * Responsabilidade: representar a visao geral do inventario.
 * O que voce encontra aqui: cards de resumo, grafico por categoria e uma amostra curta da tabela.
 * Quando mexer: altere este arquivo quando a pagina inicial do sistema mudar.
 */

import { ArrowRight, PackagePlus } from 'lucide-react';
import CategoryChart from '../components/dashboard/CategoryChart';
import InventoryStats from '../components/dashboard/InventoryStats';
import ProductTable from '../components/dashboard/ProductTable';
import { buildInventoryStats, sortProducts } from '../utils/productHelpers';

export default function Dashboard({ products, loading, onSelectSection }) {
  // O dashboard mostra apenas uma amostra dos itens mais recentes.
  const stats = buildInventoryStats(products);
  const recentProducts = sortProducts(products).slice(0, 5);

  return (
    <section className="page-shell">
      <div className="dashboard-alert-wrapper">
        {stats.criticalProducts > 0 ? (
          <div className="dashboard-alert">
            <strong>Atenção:</strong>
            <p>{`Existem ${stats.criticalProducts} produtos em nível crítico. Verifique o estoque urgente.`}</p>
          </div>
        ) : (
          <div className="dashboard-alert dashboard-alert-ok">
            <strong>Estoque estável</strong>
            <p>Todos os itens estão dentro dos limites esperados no momento.</p>
          </div>
        )}
      </div>

      <div className="page-lead">
        <div>
          <span className="page-kicker">Visao executiva</span>
          <h2>Resumo rapido do inventario</h2>
          <p>Os cards mostram volume, valor e risco de ruptura em um painel unico.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => onSelectSection?.('inventory')}
        >
          <PackagePlus size={16} />
          Gerenciar estoque
        </button>
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

          <CategoryChart products={products} loading={loading} />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Leitura rapida</span>
              <h3>Pontos de atencao</h3>
              <p>Use estes indicadores antes de abrir a pagina de estoque.</p>
            </div>
          </div>

          <div className="summary-list">
            <article className="summary-item">
              <strong>{stats.totalProducts}</strong>
              <span>produtos cadastrados hoje no painel.</span>
            </article>

            <article className="summary-item">
              <strong>{stats.criticalProducts}</strong>
              <span>itens estao em nivel critico e merecem reposicao.</span>
            </article>

            <article className="summary-item">
              <strong>{stats.totalUnits}</strong>
              <span>unidades totais estao disponiveis no inventario.</span>
            </article>
          </div>

          <button
            type="button"
            className="secondary-button summary-button"
            onClick={() => onSelectSection?.('inventory')}
          >
            Abrir tabela completa
            <ArrowRight size={16} />
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
