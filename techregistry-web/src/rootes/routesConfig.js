/**
 * Arquivo: src/rootes/routesConfig.js
 * Responsabilidade: guardar um mapa legado de rotas do projeto.
 * O que voce encontra aqui: uma lista de paginas com caminho, nome e componente que poderiam ser usadas por um sistema de roteamento.
 * Dica de manutencao: este arquivo so precisa ser atualizado se a navegacao por rotas voltar a ser usada no app.
 */

import Dashboard from '../pages/Dashboard';
import Produtos from '../pages/Produtos';

export const routes = [
  {
    path: '/',
    name: 'Dashboard',
    icon: '📊',
    element: <Dashboard />
  },
  {
    path: '/produtos',
    name: 'Produtos',
    icon: '📦',
    element: <Produtos />
  }
];