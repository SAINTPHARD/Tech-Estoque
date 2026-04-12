/**
 * Arquivo: src/services/productService.js
 * Responsabilidade: encapsular as chamadas HTTP relacionadas aos produtos.
 * O que você encontra aqui: funções pequenas para listar, criar, editar, excluir e alterar estoque.
 * Quando mexer: altere este arquivo quando os endpoints de produto mudarem.
 */

import api from "./api";

// Caminho base usado por todos os endpoints de produto.
const PRODUCT_PATH = "/products";

/**
 * Este serviço é responsável por todas as interações com a API relacionadas aos produtos.
 * Ele fornece funções para listar, criar, atualizar, excluir e buscar produtos.
 * Cada função corresponde a um endpoint específico da API e retorna os dados formatados conforme necessário.
 * O objetivo é manter a lógica de comunicação com a API centralizada e fácil de manter.
 */

/**
 * Busca todos os produtos cadastrados no backend.
 * Método HTTP: GET /api/products
 * Retorno esperado: lista de produtos em formato JSON.
 * @returns {Promise<Array>} Lista de produtos.
 */
export async function getAllProducts() {
  const { data } = await api.get(PRODUCT_PATH);
  return data;
}

/**
 * Cria um novo produto no backend.
 * Método HTTP: POST /api/products
 * @param {object} payload - Objeto com nome, categoria, preco e quantidade.
 * @returns {Promise<object>} Produto criado pela API.
 */
export async function createProduct(payload) {
  const { data } = await api.post(PRODUCT_PATH, payload);
  return data;
}

/**
 * Atualiza um produto existente pelo ID.
 * Método HTTP: PUT /api/products/:id
 * @param {number|string} productId - Identificador do produto.
 * @param {object} payload - Novos dados que serão enviados para a API.
 * @returns {Promise<object>} Produto atualizado pela API.
 */
export async function updateProduct(productId, payload) {
  const { data } = await api.put(`${PRODUCT_PATH}/${productId}`, payload);
  return data;
}

/**
 * Exclui um produto pelo ID.
 * Método HTTP: DELETE /api/products/:id
 * @param {number|string} productId - Identificador do produto a ser removido.
 * @returns {Promise<void>} Não retorna dados, apenas confirma a execução da exclusão.
 */
export async function deleteProduct(productId) {
  await api.delete(`${PRODUCT_PATH}/${productId}`);
}

/**
 * Altera a quantidade em estoque de um produto.
 * Método HTTP: PATCH /api/products/:id/estoque?delta=valor
 * @param {number|string} productId - Identificador do produto.
 * @param {number} delta - Valor positivo ou negativo somado ao estoque atual.
 * @returns {Promise<object>} Produto atualizado com a nova quantidade.
 */
export async function changeProductStock(productId, delta) {
  const { data } = await api.patch(
    `${PRODUCT_PATH}/${productId}/estoque`,
    null,
    {
      params: { delta },
    },
  );
  return data;
}

/**
 * Busca um produto pelo ID.
 * Método HTTP: GET /api/products/:id
 * @param {number|string} productId - Identificador do produto.
 * @returns {Promise<object>} Produto encontrado pela API.
 */
export async function getProductById(productId) {
  const { data } = await api.get(`${PRODUCT_PATH}/${productId}`);
  return data;
}

/**
 * Busca produtos por categoria.
 * Método HTTP: GET /api/products?categoria=nome
 * @param {string} category - Nome da categoria para filtrar os produtos.
 * @returns {Promise<Array>} Lista de produtos que pertencem à categoria especificada.
 */
export async function getProductsByCategory(category) {
  const { data } = await api.get(PRODUCT_PATH, {
    params: { categoria: category },
  });
  return data;
}

/**
 * Busca produtos por faixa de preço.
 * Método HTTP: GET /api/products?precoMin=valor&precoMax=valor
 * @param {number} minPrice - Preço mínimo para filtrar os produtos.
 * @param {number} maxPrice - Preço máximo para filtrar os produtos.
 * @returns {Promise<Array>} Lista de produtos que estão dentro da faixa de preço especificada.
 * Observação: Se precoMin ou precoMax forem omitidos, a API deve interpretar como sem limite inferior ou superior, respectivamente.
 * Exemplo: getProductsByPriceRange(10, 50) retorna produtos entre R$10 e R$50. getProductsByPriceRange(null, 100) retorna produtos até R$100.
 */
export async function getProductsByPriceRange(minPrice, maxPrice) {
  const params = {};
  if (minPrice !== null) params.precoMin = minPrice;
  if (maxPrice !== null) params.precoMax = maxPrice;
  const { data } = await api.get(PRODUCT_PATH, { params });
  return data;
}

/**
 * Busca produtos por nome.
 * Método HTTP: GET /api/products?nome=termo
 * @param {string} name - Termo de busca para o nome do produto.
 * @returns {Promise<Array>} Lista de produtos cujo nome contenha o termo especificado.
 * Observação: A busca deve ser case-insensitive e pode retornar múltiplos resultados se houver produtos com nomes semelhantes.
 * Exemplo: getProductsByName('camisa') retorna produtos como "Camisa Polo", "Camisa Social", etc.
 */
export async function getProductsByName(name) {
  const { data } = await api.get(PRODUCT_PATH, {
    params: { nome: name },
  });
  return data;
}
