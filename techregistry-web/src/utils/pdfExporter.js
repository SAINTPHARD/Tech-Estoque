/**
 * Arquivo: src/utils/pdfExporter.js
 * Responsabilidade: gerar os arquivos PDF baixados pelo frontend.
 * O que voce encontra aqui: formatos de exportacao, montagem do documento e tabelas com jsPDF.
 * Quando mexer: altere este arquivo quando os formatos de relatorio mudarem.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './currencyFormatter';
import { formatDateTime } from './datePicker';
import {
  buildCategoryChartData,
  buildInventoryStats,
  getStockStatus,
  sortProducts,
} from './productHelpers';

export const PDF_EXPORT_OPTIONS = [
  {
    id: 'summary',
    label: 'Resumo executivo',
    description: 'Indicadores, categorias e destaques.',
  },
  {
    id: 'inventory',
    label: 'Inventario atual',
    description: 'Tabela completa da visao filtrada.',
  },
  {
    id: 'critical',
    label: 'Reposicao urgente',
    description: 'Itens em status critico ou atencao.',
  },
];

function buildFileStamp() {
  return new Date().toISOString().slice(0, 10);
}

function buildFilterSummary(filters = {}) {
  const summary = [];

  if (filters.searchTerm?.trim()) {
    summary.push(`Busca: ${filters.searchTerm.trim()}`);
  }

  if (filters.categoryFilter && filters.categoryFilter !== 'all') {
    summary.push(`Categoria: ${filters.categoryFilter}`);
  }

  if (filters.stockFilter && filters.stockFilter !== 'all') {
    summary.push(`Status: ${filters.stockFilter}`);
  }

  return summary.length ? summary.join(' | ') : 'Sem filtros aplicados.';
}

function buildProductRows(products = []) {
  return sortProducts(products, 'name').map((product) => {
    const stockStatus = getStockStatus(product.quantidade);

    return [
      `#${product.id}`,
      product.nome,
      product.categoria || 'Sem categoria',
      formatCurrency(product.preco),
      String(product.quantidade),
      stockStatus.label,
      formatCurrency(product.preco * product.quantidade),
    ];
  });
}

function createDocument(format) {
  return new jsPDF({
    orientation: format === 'summary' ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });
}

function drawHeader(doc, title, subtitle) {
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(14, 12, 182, 28, 8, 8, 'F');
  doc.setTextColor(248, 250, 252);
  doc.setFontSize(18);
  doc.text(title, 20, 24);
  doc.setFontSize(10);
  doc.text(subtitle, 20, 32);
  doc.setTextColor(15, 23, 42);
}

function drawSummaryCard(doc, { title, value, helper, x, y, width }) {
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(219, 228, 240);
  doc.roundedRect(x, y, width, 28, 6, 6, 'FD');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(title, x + 4, y + 7);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(String(value), x + 4, y + 16);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(doc.splitTextToSize(helper, width - 8), x + 4, y + 23);
}

function exportSummaryDocument(doc, { products, allProducts, filters }) {
  const stats = buildInventoryStats(products);
  const baseStats = buildInventoryStats(allProducts);
  const categories = buildCategoryChartData(products);
  const topProducts = sortProducts(products, 'value-desc').slice(0, 5);

  drawHeader(
    doc,
    'Resumo executivo do estoque',
    `Gerado em ${formatDateTime()} | ${buildFilterSummary(filters)}`
  );

  const cards = [
    {
      title: 'Produtos visiveis',
      value: stats.totalProducts,
      helper: `Base completa com ${baseStats.totalProducts} itens cadastrados.`,
    },
    {
      title: 'Unidades',
      value: stats.totalUnits,
      helper: 'Volume total da visao exportada.',
    },
    {
      title: 'Valor em estoque',
      value: formatCurrency(stats.totalValue),
      helper: 'Patrimonio estimado do recorte atual.',
    },
    {
      title: 'Itens criticos',
      value: stats.criticalProducts,
      helper: 'Produtos que pedem reposicao imediata.',
    },
  ];

  cards.forEach((card, index) => {
    drawSummaryCard(doc, {
      ...card,
      x: 14 + index * 46,
      y: 48,
      width: 42,
    });
  });

  autoTable(doc, {
    startY: 84,
    head: [['Categoria', 'Produtos', 'Unidades']],
    body: categories.length
      ? categories.map((item) => [
          item.categoria,
          String(item.quantidadeProdutos),
          String(item.totalUnidades),
        ])
      : [['Sem dados', '0', '0']],
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
    },
    styles: {
      fontSize: 9,
    },
    margin: { left: 14, right: 14 },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Produto', 'Categoria', 'Status', 'Valor total']],
    body: topProducts.length
      ? topProducts.map((product) => [
          product.nome,
          product.categoria || 'Sem categoria',
          getStockStatus(product.quantidade).label,
          formatCurrency(product.preco * product.quantidade),
        ])
      : [['Sem produtos', '-', '-', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
    },
    styles: {
      fontSize: 9,
    },
    margin: { left: 14, right: 14 },
  });
}

function exportTableDocument(doc, { title, products, filters }) {
  drawHeader(
    doc,
    title,
    `Gerado em ${formatDateTime()} | ${buildFilterSummary(filters)}`
  );

  const body = buildProductRows(products);

  if (!body.length) {
    doc.setFontSize(12);
    doc.text('Nenhum produto encontrado para este formato de exportacao.', 20, 56);
    return;
  }

  autoTable(doc, {
    startY: 50,
    head: [['ID', 'Produto', 'Categoria', 'Preco', 'Qtd', 'Status', 'Valor total']],
    body,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.8,
    },
    margin: { left: 12, right: 12 },
  });
}

export function exportProductsPdf({
  format = 'inventory',
  products = [],
  allProducts = products,
  filters = {},
}) {
  const doc = createDocument(format);
  const visibleProducts = sortProducts(products);
  const criticalProducts = visibleProducts.filter((product) => {
    const stockStatus = getStockStatus(product.quantidade).id;
    return stockStatus === 'critical' || stockStatus === 'warning';
  });

  if (format === 'summary') {
    exportSummaryDocument(doc, {
      products: visibleProducts,
      allProducts,
      filters,
    });
  } else if (format === 'critical') {
    exportTableDocument(doc, {
      title: 'Relatorio de reposicao urgente',
      products: criticalProducts,
      filters,
    });
  } else {
    exportTableDocument(doc, {
      title: 'Relatorio do inventario atual',
      products: visibleProducts,
      filters,
    });
  }

  const fileName = `techregistry-${format}-${buildFileStamp()}.pdf`;
  doc.save(fileName);
  return fileName;
}
