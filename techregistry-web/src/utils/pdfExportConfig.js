/**
 * Arquivo: src/utils/pdfExportConfig.js
 * Responsabilidade: centralizar os formatos disponiveis para exportacao em PDF.
 * O que voce encontra aqui: opcoes leves usadas pela interface antes de carregar o gerador.
 * Quando mexer: altere este arquivo quando os formatos de relatorio mudarem.
 */

// Mantem a configuracao de exportacao separada do jsPDF para evitar peso no carregamento inicial.
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
