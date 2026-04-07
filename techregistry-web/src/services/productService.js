/**
 * Arquivo: src/services/productService.js
 * Responsabilidade: encapsular as chamadas HTTP relacionadas aos produtos.
 * O que voce encontra aqui: funcoes pequenas para listar, criar, editar, excluir e alterar estoque.
 * Quando mexer: altere este arquivo quando os endpoints de produto mudarem.
 */

import api from './api';

// Caminho base usado por todos os endpoints de produto.
const PRODUCT_PATH = '/products';

/**
 * Busca todos os produtos cadastrados no backend.
 * Metodo HTTP: GET /api/produtos
 * Retorno esperado: lista de produtos em formato JSON.
 */
export async function getAllProducts() {
  const { data } = await api.get(PRODUCT_PATH);
  return data;
}

/**
 * Cria um novo produto no backend.
 * Metodo HTTP: POST /api/produtos
 * @param {object} payload - Objeto com nome, categoria, preco e quantidade.
 * @returns {Promise<object>} Produto criado pela API.
 */
export async function createProduct(payload) {
  const { data } = await api.post(PRODUCT_PATH, payload);
  return data;
}

/**
 * Atualiza um produto existente pelo ID.
 * Metodo HTTP: PUT /api/produtos/:id
 * @param {number|string} productId - Identificador do produto.
 * @param {object} payload - Novos dados que serao enviados para a API.
 * @returns {Promise<object>} Produto atualizado pela API.
 */
export async function updateProduct(productId, payload) {
  const { data } = await api.put(`${PRODUCT_PATH}/${productId}`, payload);
  return data;
}

/**
 * Exclui um produto pelo ID.
 * Metodo HTTP: DELETE /api/produtos/:id
 * @param {number|string} productId - Identificador do produto a ser removido.
 * @returns {Promise<void>} Nao retorna dados, apenas confirma a execucao da exclusao.
 */
export async function deleteProduct(productId) {
  await api.delete(`${PRODUCT_PATH}/${productId}`);
}

/**
 * Altera a quantidade em estoque de um produto.
 * Metodo HTTP: PATCH /api/produtos/:id/estoque?delta=valor
 * @param {number|string} productId - Identificador do produto.
 * @param {number} delta - Valor positivo ou negativo somado ao estoque atual.
 * @returns {Promise<object>} Produto atualizado com a nova quantidade.
 */
export async function changeProductStock(productId, delta) {
  const { data } = await api.patch(`${PRODUCT_PATH}/${productId}/estoque`, null, {
    params: { delta },
  });
  return data;
}
