/**
 * Arquivo: src/components/dashboard/CategoryChart.jsx
 * Responsabilidade: mostrar o grafico de categorias do estoque.
 * O que voce encontra aqui: tratamento de loading, estado vazio e montagem do grafico com Recharts.
 * Quando mexer: use este arquivo quando a visualizacao analitica por categoria mudar.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildCategoryChartData } from '../../../utils/productHelpers';
import './style.css';

export default function CategoryChart({ products = [], loading = false }) {
  // Converte a lista bruta em um formato pronto para o grafico.
  const chartData = buildCategoryChartData(products);

  if (loading) {
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

  if (!chartData.length) {
    return (
      <div className="category-chart-shell category-chart-empty">
        <strong>Sem categorias suficientes para montar o grafico.</strong>
        <p>Cadastre produtos para gerar a distribuicao por categoria.</p>
      </div>
    );
  }

  return (
    <div className="category-chart-shell">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#dbe4f0" />
          <XAxis
            dataKey="categoria"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(37, 99, 235, 0.08)' }}
            formatter={(value, _name, item) => [
              `${value} unidades`,
              `${item.payload.quantidadeProdutos} produtos`,
            ]}
            labelFormatter={(value) => `Categoria: ${value}`}
          />
          <Bar dataKey="totalUnidades" fill="#2563eb" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="category-chart-list">
        {chartData.map((item) => (
          <article key={item.categoria} className="category-chart-item">
            <strong>{item.categoria}</strong>
            <span>{item.quantidadeProdutos} produtos</span>
            <small>{item.totalUnidades} unidades</small>
          </article>
        ))}
      </div>
    </div>
  );
}
