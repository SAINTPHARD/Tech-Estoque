/**
 * Arquivo: src/components/ProdutoTabela.jsx
 * Responsabilidade: exibir uma tabela simples de produtos da versao legada do sistema.
 * O que voce encontra aqui: cabecalho de colunas e renderizacao direta da lista sem filtros ou interacoes avancadas.
 * Dica de manutencao: a tabela principal e mais completa e hoje mora em ProdutosDataTable.jsx.
 */

import { formatCurrency } from '../utils/produtos';

export default function ProdutoTabela({ produtos = [] }) {
  if (!produtos.length) {
    return <p>Nenhum produto disponível para exibir.</p>;
  }

  return (
    <table className="tabela">
      <thead>
        <tr>
          <th>ID</th>
          <th>Produto</th>
          <th>Preço</th>
          <th>Qtd</th>
        </tr>
      </thead>

      <tbody>
        {produtos.map((produto) => (
          <tr key={produto.id}>
            <td>{produto.id}</td>
            <td>{produto.nome}</td>
            <td>{formatCurrency(produto.preco)}</td>
            <td>{produto.quantidade}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
