/**
 * Arquivo: src/hooks/useProducts.js
 * Responsabilidade: concentrar a logica de leitura e escrita de produtos no frontend.
 * O que voce encontra aqui: carregamento inicial, cadastro, edicao, exclusao, importacao e feedbacks.
 * Quando mexer: use este hook quando a regra de negocio do inventario mudar na camada React.
 */

import { useCallback, useEffect, useState } from 'react';
import { buildApiErrorFeedback } from '../services/api';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from '../services/productService';
import {
  normalizeProduct,
  normalizeProducts,
  removeProduct,
  sortProducts,
  upsertProduct,
} from '../utils/productHelpers';

function buildSuccessFeedback(type, productName) {
  if (type === 'update') {
    return {
      type: 'success',
      text: `As informacoes de "${productName}" foram atualizadas.`,
    };
  }

  return {
    type: 'success',
    text: `Produto "${productName}" cadastrado com sucesso.`,
  };
}

function isValidProductPayload(product = {}) {
  return (
    Boolean(product.nome) &&
    Boolean(product.categoria) &&
    Number.isFinite(product.preco) &&
    product.preco > 0 &&
    Number.isInteger(product.quantidade) &&
    product.quantidade >= 0
  );
}

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshProducts = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await getAllProducts();
      const normalizedData = sortProducts(Array.isArray(data) ? data : []);

      setProducts(normalizedData);
      setLastUpdated(new Date());
      setError(null);

      return {
        ok: true,
        data: normalizedData,
      };
    } catch (requestError) {
      console.error('Erro ao carregar produtos:', requestError);
      const nextError = buildApiErrorFeedback(requestError, '/products');
      setError(nextError);

      return {
        ok: false,
        error: nextError,
      };
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleCreateProduct = async (payload) => {
    const nextProduct = normalizeProduct(payload);

    setSaving(true);
    setFeedback(null);

    try {
      const createdProduct = await createProduct(nextProduct);

      setProducts((currentProducts) =>
        sortProducts(upsertProduct(currentProducts, createdProduct)),
      );
      await refreshProducts(false);
      setError(null);

      const nextFeedback = buildSuccessFeedback('create', nextProduct.nome);
      setFeedback(nextFeedback);
      setLastUpdated(new Date());

      return {
        ok: true,
        message: nextFeedback.text,
      };
    } catch (requestError) {
      console.error('Erro ao cadastrar produto:', requestError);
      const nextError = buildApiErrorFeedback(requestError, '/products');

      setFeedback({
        type: 'error',
        text: nextError.message,
        hint: nextError.hint,
      });

      return {
        ok: false,
        message: nextError.message,
        hint: nextError.hint,
      };
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (productId, payload) => {
    const nextProduct = normalizeProduct(payload);

    setSaving(true);
    setFeedback(null);

    try {
      const updatedProduct = await updateProduct(productId, nextProduct);

      setProducts((currentProducts) =>
        sortProducts(upsertProduct(currentProducts, updatedProduct)),
      );
      await refreshProducts(false);
      setError(null);

      const nextFeedback = buildSuccessFeedback('update', nextProduct.nome);
      setFeedback(nextFeedback);
      setLastUpdated(new Date());

      return {
        ok: true,
        message: nextFeedback.text,
      };
    } catch (requestError) {
      console.error('Erro ao atualizar produto:', requestError);
      const nextError = buildApiErrorFeedback(requestError, `/products/${productId}`);

      setFeedback({
        type: 'error',
        text: nextError.message,
        hint: nextError.hint,
      });

      return {
        ok: false,
        message: nextError.message,
        hint: nextError.hint,
      };
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    setDeleteId(product.id);
    setFeedback(null);

    try {
      await deleteProduct(product.id);
      setProducts((currentProducts) =>
        removeProduct(currentProducts, product.id),
      );
      await refreshProducts(false);
      setError(null);
      setFeedback({
        type: 'success',
        text: `"${product.nome}" foi removido do inventario.`,
      });
      setLastUpdated(new Date());

      return {
        ok: true,
      };
    } catch (requestError) {
      console.error('Erro ao excluir produto:', requestError);
      const nextError = buildApiErrorFeedback(requestError, `/products/${product.id}`);

      setFeedback({
        type: 'error',
        text: nextError.message,
        hint: nextError.hint,
      });

      return {
        ok: false,
        message: nextError.message,
        hint: nextError.hint,
      };
    } finally {
      setDeleteId(null);
    }
  };

  const handleImportProducts = async (items = []) => {
    const validItems = normalizeProducts(items).filter(isValidProductPayload);

    if (!validItems.length) {
      const nextMessage = 'Nenhum produto valido foi enviado para importacao.';

      setFeedback({
        type: 'error',
        text: nextMessage,
        hint: 'Revise nome, categoria, preco e quantidade antes de importar.',
      });

      return {
        ok: false,
        importedCount: 0,
        failedCount: 0,
        message: nextMessage,
      };
    }

    setImporting(true);
    setFeedback(null);

    let importedCount = 0;
    let failedCount = 0;
    let lastError = null;

    try {
      // O envio sequencial evita sobrecarregar a API e facilita identificar falhas pontuais.
      for (const product of validItems) {
        try {
          await createProduct(product);
          importedCount += 1;
        } catch (requestError) {
          failedCount += 1;
          lastError = requestError;
        }
      }

      if (importedCount > 0) {
        await refreshProducts(false);
        setLastUpdated(new Date());
        setError(null);
      }

      if (!importedCount) {
        const nextError = buildApiErrorFeedback(lastError, '/products');

        setFeedback({
          type: 'error',
          text: 'Nenhum produto foi importado.',
          hint: nextError.hint || nextError.message,
        });

        return {
          ok: false,
          importedCount,
          failedCount,
          message: 'Nenhum produto foi importado.',
          hint: nextError.hint || nextError.message,
        };
      }

      const nextFeedback = {
        type: failedCount ? 'info' : 'success',
        text: failedCount
          ? `${importedCount} produtos importados e ${failedCount} falharam.`
          : `${importedCount} produtos importados com sucesso.`,
        hint: failedCount
          ? 'Revise o arquivo e tente novamente apenas com os registros que falharam.'
          : 'A lista do dashboard ja foi atualizada com os novos itens.',
      };

      setFeedback(nextFeedback);

      return {
        ok: failedCount === 0,
        partial: failedCount > 0,
        importedCount,
        failedCount,
        message: nextFeedback.text,
        hint: nextFeedback.hint,
      };
    } finally {
      setImporting(false);
    }
  };

  return {
    products,
    loading,
    saving,
    importing,
    deleteId,
    error,
    feedback,
    lastUpdated,
    actions: {
      refreshProducts,
      createProduct: handleCreateProduct,
      updateProduct: handleUpdateProduct,
      deleteProduct: handleDeleteProduct,
      importProducts: handleImportProducts,
      clearFeedback: () => setFeedback(null),
    },
  };
}
