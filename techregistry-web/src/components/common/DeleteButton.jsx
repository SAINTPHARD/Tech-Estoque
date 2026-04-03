/**
 * Arquivo: src/components/common/DeleteButton.jsx
 * Responsabilidade: renderizar o botao reutilizavel de exclusao.
 * O que voce encontra aqui: confirmacao simples antes de remover um item.
 * Quando mexer: ajuste este arquivo se o comportamento padrao de exclusao mudar.
 */

import { LoaderCircle, Trash2 } from 'lucide-react';
import './DeleteButton.css';

export default function DeleteButton({ onConfirm, itemName = 'item', busy = false }) {
  const handleDelete = async () => {
    // Bloqueia cliques duplicados enquanto a exclusao ainda esta em andamento.
    if (!onConfirm || busy) {
      return;
    }

    const confirmed = window.confirm(`Tem certeza que deseja excluir "${itemName}"?`);

    if (!confirmed) {
      return;
    }

    await onConfirm();
  };

  return (
    <button
      className="icon-button icon-button-delete"
      type="button"
      onClick={handleDelete}
      disabled={busy}
      aria-label={`Excluir ${itemName}`}
      title={`Excluir ${itemName}`}
    >
      {busy ? <LoaderCircle size={16} className="delete-button-spinner" /> : <Trash2 size={16} />}
    </button>
  );
}
