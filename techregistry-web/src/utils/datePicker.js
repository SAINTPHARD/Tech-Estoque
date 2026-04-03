/**
 * Arquivo: src/utils/datePicker.js
 * Responsabilidade: padronizar a exibicao de datas no frontend.
 * O que voce encontra aqui: funcoes para data completa e para rotulos curtos do cabecalho.
 * Quando mexer: use este arquivo quando o formato de data da interface mudar.
 */

// Exibe uma data completa com dia e horario no padrao pt-BR.
export function formatDateTime(value = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

// Exibe uma versao curta da data para titulos e pequenos resumos.
export function formatDateLabel(value = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(value));
}
