/**
 * Arquivo: src/components/BotaoEditar.jsx
 * Responsabilidade: encapsular a acao de editar em um botao pequeno e reutilizavel.
 * O que voce encontra aqui: um controle iconico com acessibilidade basica para abrir o fluxo de edicao.
 * Dica de manutencao: mexa aqui quando o comportamento ou a semantica do botao de editar mudar no sistema.
 */

import { SquarePen } from 'lucide-react';
import './BotaoEditar.css';

export default function BotaoEditar({ onClick, disabled = false }) {
  // Converte a acao de edicao em um controle discreto para nao disputar atencao com os dados.
  return (
    <button
      type="button"
      className="btn-editar"
      onClick={onClick}
      disabled={disabled}
      aria-label="Editar produto"
      title="Editar produto"
    >
      <SquarePen size={16} />
    </button>
  );
}
