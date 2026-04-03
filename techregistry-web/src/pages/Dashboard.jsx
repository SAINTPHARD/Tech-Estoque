/**
 * Arquivo: src/pages/Dashboard.jsx
 * Responsabilidade: representar uma versao legada da pagina de dashboard fora do fluxo principal atual.
 * O que voce encontra aqui: carregamento simples de produtos e exibicao em tabela com um header antigo.
 * Dica de manutencao: hoje o fluxo principal esta em App.jsx; mexa aqui apenas se for reativar a arquitetura por paginas.
 */

import { useEffect, useState } from 'react';
import api from '../lib/api';
import ProdutoTabela from '../components/ProdutoTabela';
import Header from '../components/header';
import '../styles/dashboard.css';

const API = '/produtos';

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);

  const carregarProdutos = async () => {
    try {
      const { data } = await api.get(API);
      setProdutos(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <div className="dashboard">
      <Header />

      <div className="container">
        <h2>Gestao de Produtos</h2>
        <ProdutoTabela produtos={produtos} />
      </div>
    </div>
  );
}
