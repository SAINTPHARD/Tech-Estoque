/**
 * Arquivo: src/components/BotaoExcluir.jsx
 * Responsabilidade: oferecer a exclusao com confirmacao simples e direta no fluxo principal do dashboard.
 * O que voce encontra aqui: acionamento da lixeira, confirmacao nativa do navegador e disparo da exclusao.
 * Dica de manutencao: qualquer ajuste de UX da exclusao principal deve ser feito aqui.
 */

import { LoaderCircle, Trash2 } from 'lucide-react';
import './BotaoExcluir.css';

export default function BotaoExcluir({ onConfirm, itemNome = 'item', busy = false }) {
  const handleDelete = async () => {
    if (!onConfirm || busy) {
      return;
    }

    const accepted = window.confirm(`Tem certeza que deseja excluir "${itemNome}"?`);

    if (!accepted) {
      return;
    }

    await onConfirm();
  };

  return (
    <div className="delete-action-shell">
      <button
        className="btn-excluir"
        type="button"
        onClick={handleDelete}
        disabled={busy}
        aria-label={`Excluir ${itemNome}`}
        title={`Excluir ${itemNome}`}
      >
        {busy ? <LoaderCircle size={16} className="delete-button-spinner" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}
