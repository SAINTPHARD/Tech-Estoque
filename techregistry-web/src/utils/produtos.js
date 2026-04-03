/**
 * Arquivo: src/utils/produtos.js
 * Responsabilidade: concentrar funcoes utilitarias relacionadas a produtos e estoque.
 * O que voce encontra aqui: formatacao monetaria, normalizacao, ordenacao, status de estoque e agrupamentos para o grafico.
 * Dica de manutencao: sempre prefira colocar regra de negocio compartilhada aqui em vez de duplicar logica nos componentes.
 */

export const STOCK_LEVELS = {
  critical: 5,
  warning: 20,
};

export const STOCK_STATUS_OPTIONS = [
  {
    id: 'all',
    label: 'Todos',
    tone: 'all',
    chartColor: '#cbd5e1',
  },
  {
    id: 'critical',
    label: 'Critico',
    tone: 'critical',
    chartColor: '#ef4444',
  },
  {
    id: 'warning',
    label: 'Atencao',
    tone: 'warning',
    chartColor: '#f59e0b',
  },
  {
    id: 'healthy',
    label: 'Saudavel',
    tone: 'healthy',
    chartColor: '#22c55e',
  },
];

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function normalizeProduct(produto) {
  return {
    ...produto,
    categoria: typeof produto?.categoria === 'string' ? produto.categoria.trim() : '',
    preco: Number(produto?.preco) || 0,
    quantidade: Number(produto?.quantidade) || 0,
  };
}

export function sortProducts(produtos = []) {
  return [...produtos]
    .map(normalizeProduct)
    .sort((produtoA, produtoB) => produtoA.id - produtoB.id);
}

export function getStockStatus(quantidade) {
  if (quantidade <= STOCK_LEVELS.critical) {
    return {
      id: 'critical',
      label: 'Critico',
      tone: 'critical',
      description: 'Reposicao urgente',
      chartColor: '#ef4444',
    };
  }

  if (quantidade < STOCK_LEVELS.warning) {
    return {
      id: 'warning',
      label: 'Atencao',
      tone: 'warning',
      description: 'Estoque baixo',
      chartColor: '#f59e0b',
    };
  }

  return {
    id: 'healthy',
    label: 'Saudavel',
    tone: 'healthy',
    description: 'Nivel confortavel',
    chartColor: '#22c55e',
  };
}

export function sortProductsBy(produtos = [], sortOption = 'recent') {
  const nextProducts = [...produtos];

  switch (sortOption) {
    case 'name':
      return nextProducts.sort((produtoA, produtoB) => produtoA.nome.localeCompare(produtoB.nome));
    case 'stock-asc':
      return nextProducts.sort((produtoA, produtoB) => produtoA.quantidade - produtoB.quantidade);
    case 'stock-desc':
      return nextProducts.sort((produtoA, produtoB) => produtoB.quantidade - produtoA.quantidade);
    case 'value-desc':
      return nextProducts.sort(
        (produtoA, produtoB) =>
          produtoB.preco * produtoB.quantidade - produtoA.preco * produtoA.quantidade
      );
    case 'value-asc':
      return nextProducts.sort(
        (produtoA, produtoB) =>
          produtoA.preco * produtoA.quantidade - produtoB.preco * produtoB.quantidade
      );
    case 'recent':
    default:
      return nextProducts.sort((produtoA, produtoB) => produtoB.id - produtoA.id);
  }
}

export function groupProductsByStockStatus(produtos = []) {
  return STOCK_STATUS_OPTIONS.filter((option) => option.id !== 'all')
    .map((option) => {
      const products = produtos.filter((produto) => getStockStatus(produto.quantidade).id === option.id);

      return {
        id: option.id,
        name: option.label,
        tone: option.tone,
        color: option.chartColor,
        productCount: products.length,
        totalUnits: products.reduce((accumulator, produto) => accumulator + produto.quantidade, 0),
      };
    })
    .filter((group) => group.productCount > 0);
}
