/**
 * Arquivo: src/BotaoExcluir.jsx
 * Responsabilidade: manter uma implementacao legada e simplificada de exclusao direta via axios.
 * O que voce encontra aqui: um botao antigo que conversa com a API e recarrega a lista por callback.
 * Dica de manutencao: o fluxo principal usa src/components/BotaoExcluir.jsx; altere este arquivo so se a versao legada voltar a ser usada.
 */

import api from './lib/api';

export default function BotaoExcluir({ id, onExcluido }) {
  const deletar = async () => {
    if (window.confirm('Deseja realmente excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        alert('Excluido com sucesso!');

        if (onExcluido) {
          onExcluido();
        }
      } catch (err) {
        console.error('Erro ao deletar:', err);
      }
    }
  };

  return (
    <button
      onClick={deletar}
      style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
    >
      Excluir
    </button>
  );
}
