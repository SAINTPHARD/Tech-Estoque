/**
 * Arquivo: src/components/dashboard/InventoryStats.jsx
 * Responsabilidade: exibir os indicadores principais do inventario.
 * O que voce encontra aqui: cards com volume, valor total e itens criticos.
 * Quando mexer: ajuste este arquivo quando os KPIs do dashboard mudarem.
 */

import { formatCurrency } from '../../utils/currencyFormatter';
import { buildInventoryStats } from '../../utils/productHelpers';

function StatSkeleton() {
  return (
    <article className="stat-card stat-card-skeleton">
      <span className="skeleton-line skeleton-line-sm" />
      <strong className="skeleton-line skeleton-line-lg" />
      <small className="skeleton-line skeleton-line-md" />
    </article>
  );
}

export default function InventoryStats({ products = [], loading = false }) {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((item) => (
          <StatSkeleton key={item} />
        ))}
      </div>
    );
  }

  // Consolida os numeros em um bloco unico para facilitar a renderizacao dos cards.
  const stats = buildInventoryStats(products);
  const cards = [
    {
      label: 'Produtos',
      value: stats.totalProducts,
      helper: 'itens cadastrados na base atual',
      tone: 'blue',
    },
    {
      label: 'Unidades',
      value: stats.totalUnits,
      helper: 'volume total disponivel em estoque',
      tone: 'green',
    },
    {
      label: 'Valor em estoque',
      value: formatCurrency(stats.totalValue),
      helper: 'patrimonio total vinculado aos produtos',
      tone: 'amber',
    },
    {
      label: 'Itens criticos',
      value: stats.criticalProducts,
      helper: 'produtos com reposicao urgente',
      tone: 'rose',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <article key={card.label} className={`stat-card stat-card-${card.tone}`}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.helper}</small>
        </article>
      ))}
    </div>
  );
}
