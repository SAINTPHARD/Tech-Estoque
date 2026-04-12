/**
 * Arquivo: src/components/common/EditButton.jsx
 * Responsabilidade: renderizar o botao reutilizavel de edicao.
 * O que voce encontra aqui: um disparador visual pequeno para abrir formularios de alteracao.
 * Quando mexer: altere este arquivo se a acao de editar mudar de comportamento ou de estilo.
 */

import { SquarePen } from 'lucide-react';
import './style.css';

export default function EditButton({ onClick, disabled = false }) {
  // Botão de edição simples com ícone, usado em cada linha da tabela.
  return (
    <button
      type="button"
      className="icon-button icon-button-edit"
      onClick={onClick}
      disabled={disabled}
      aria-label="Editar produto"
      title="Editar produto"
    >
      <SquarePen size={16} />
    </button>
  );
}
