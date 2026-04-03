/**
 * Arquivo: src/components/CardsResumo.jsx
 * Responsabilidade: mostrar os indicadores de topo do dashboard de forma sintetica.
 * O que voce encontra aqui: calculo de totais, patrimonio, produto destaque e versoes skeleton para loading.
 * Dica de manutencao: altere este arquivo quando a leitura executiva do painel precisar de novos KPIs.
 */

import { formatCurrency } from '../utils/produtos';

export default function CardsResumo({ dados, filtroAtivo = false, loading = false }) {
  if (loading) {
    return (
      <div className="resumo-container">
        {[1, 2, 3].map((item, index) => (
          <div key={item} className={`card-resumo card-resumo-skeleton ${index === 1 ? 'green' : index === 2 ? 'amber' : 'blue'}`}>
            <span className="skeleton-block skeleton-line-sm" />
            <h2 className="skeleton-block skeleton-line-lg" />
            <small className="skeleton-block skeleton-line-md" />
          </div>
        ))}
      </div>
    );
  }

  const totalItens = dados.reduce((accumulator, produto) => accumulator + produto.quantidade, 0);
  const valorTotal = dados.reduce(
    (accumulator, produto) => accumulator + produto.preco * produto.quantidade,
    0
  );
  const itensCriticos = dados.filter((produto) => produto.quantidade <= 5).length;
  const produtoDestaque = [...dados].sort(
    (produtoA, produtoB) => produtoB.quantidade - produtoA.quantidade
  )[0];
  const ticketMedio = dados.length ? valorTotal / dados.length : 0;

  return (
    <div className="resumo-container">
      {/* Resume o risco operacional do estoque em um indicador de leitura rapida. */}
      <div className="card-resumo blue">
        <span>Total em estoque</span>
        <h2>{totalItens}</h2>
        <small>
          {itensCriticos} item{itensCriticos === 1 ? '' : 's'} em nivel critico
          {filtroAtivo ? ' na visao filtrada.' : '.'}
        </small>
      </div>

      {/* Consolida o valor financeiro do inventario para leitura gerencial. */}
      <div className="card-resumo green">
        <span>Patrimonio total</span>
        <h2>{formatCurrency(valorTotal)}</h2>
        <small>
          Ticket medio por produto: {formatCurrency(ticketMedio)}
          {filtroAtivo ? ' considerando o filtro atual.' : '.'}
        </small>
      </div>

      {/* Mostra a amplitude do catalogo e destaca o item com maior volume. */}
      <div className="card-resumo amber">
        <span>Variedade</span>
        <h2>{dados.length} produtos</h2>
        <small>
          {produtoDestaque
            ? `${produtoDestaque.nome} lidera o estoque com ${produtoDestaque.quantidade} unidades.`
            : 'Adicione produtos para liberar os indicadores do painel.'}
        </small>
      </div>
    </div>
  );
}
