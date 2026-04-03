/**
 * Arquivo: src/utils/currencyFormatter.js
 * Responsabilidade: padronizar a exibicao de valores monetarios.
 * O que voce encontra aqui: uma funcao pequena para transformar numeros em texto no formato brasileiro.
 * Quando mexer: altere este arquivo se a regra de moeda do projeto mudar.
 */

// Converte qualquer numero recebido para o formato de moeda usado na interface.
export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
