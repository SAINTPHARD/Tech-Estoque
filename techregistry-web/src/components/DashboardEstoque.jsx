/**
 * Arquivo: src/components/DashboardEstoque.jsx
 * Responsabilidade: renderizar o grafico de rosca que resume o estoque por status.
 * O que voce encontra aqui: agrupamento dos dados, estados de loading e interacao que filtra a tabela ao clicar.
 * Dica de manutencao: este componente e o ponto certo para evoluir visualizacoes analiticas do painel.
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardEstoque.css';
import { groupProductsByStockStatus } from '../utils/produtos';

export default function DashboardEstoque({
  dados,
  loading = false,
  activeStatus = 'all',
  onSelectStatus,
}) {
  const chartData = groupProductsByStockStatus(dados ?? []);
  const totalItens = chartData.reduce((accumulator, item) => accumulator + item.productCount, 0);
  const totalUnidades = chartData.reduce((accumulator, item) => accumulator + item.totalUnits, 0);
  const activeGroup = chartData.find((item) => item.id === activeStatus);

  if (loading) {
    return (
      <div className="dashboard-chart dashboard-chart-loading">
        {/* Exibe um esqueleto do grafico para manter o card vivo durante o carregamento. */}
        <div className="dashboard-chart-header">
          <span className="skeleton-block skeleton-line-sm" />
          <span className="skeleton-block skeleton-line-md" />
          <span className="skeleton-block skeleton-line-lg" />
        </div>

        <div className="chart-skeleton-ring">
          <span className="skeleton-ring-outer" />
          <span className="skeleton-ring-inner" />
        </div>

        <div className="chart-skeleton-legend">
          {[1, 2, 3].map((item) => (
            <span key={item} className="skeleton-block skeleton-line-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="dashboard-chart dashboard-chart-empty">
        <h3 className="dashboard-chart-title">Distribuicao de estoque</h3>
        <p className="dashboard-chart-empty-text">Sem dados validos para exibir o grafico.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-chart">
      {/* Troca o foco do grafico para categorias de status, permitindo filtrar a tabela por clique. */}
      <div className="dashboard-chart-header">
        <h3 className="dashboard-chart-title">Distribuicao por status</h3>
        <span className="dashboard-chart-total">
          {totalItens} produtos • {totalUnidades} unidades
        </span>
        <p className="dashboard-chart-highlight">
          {activeGroup
            ? `Filtro ativo: ${activeGroup.name}. Clique novamente para limpar.`
            : 'Clique em um status para filtrar a tabela de produtos.'}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="48%"
            innerRadius={68}
            outerRadius={108}
            paddingAngle={4}
            dataKey="productCount"
            label={false}
            labelLine={false}
            stroke="#ffffff"
            strokeWidth={3}
            isAnimationActive
            onClick={(entry) => {
              const nextStatus = activeStatus === entry.id ? 'all' : entry.id;
              onSelectStatus?.(nextStatus);
            }}
          >
            {chartData.map((item) => (
              <Cell
                key={`cell-${item.id}`}
                fill={item.color}
                opacity={activeStatus === 'all' || activeStatus === item.id ? 1 : 0.45}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value, _name, item) => [
              `${value} produto${value === 1 ? '' : 's'} • ${item.payload.totalUnits} unidades`,
              item.payload.name,
            ]}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 24px rgba(15,23,42,0.14)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Substitui a legenda padrao por chips clicaveis para reforcar a interacao com o filtro. */}
      <div className="dashboard-chart-legend">
        {chartData.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dashboard-chart-legend-item${activeStatus === item.id ? ' is-active' : ''}`}
            onClick={() => onSelectStatus?.(activeStatus === item.id ? 'all' : item.id)}
          >
            <span className="dashboard-chart-legend-dot" style={{ backgroundColor: item.color }} />
            <strong>{item.name}</strong>
            <small>{item.productCount} produtos</small>
          </button>
        ))}
      </div>
    </div>
  );
}
