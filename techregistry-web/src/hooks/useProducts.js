/**
 * Arquivo: src/hooks/useProducts.js
 * Responsabilidade: concentrar a logica de leitura e escrita de produtos no frontend.
 * O que voce encontra aqui: carregamento inicial, cadastro, edicao, exclusao e mensagens de feedback.
 * Quando mexer: use este hook quando a regra de negocio do inventario mudar na camada React.
 */

import { useCallback, useEffect, useState } from "react";
import { buildApiErrorFeedback } from "../services/api";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../services/productService";
import {
  normalizeProducts,
  removeProduct,
  sortProducts,
  upsertProduct,
} from "../utils/productHelpers";

function buildSuccessFeedback(type, productName) {
  // Padroniza as mensagens de sucesso para criar e editar.
  if (type === "update") {
    return {
      type: "success",
      text: `As informacoes de "${productName}" foram atualizadas.`,
    };
  }

  return {
    type: "success",
    text: `Produto "${productName}" cadastrado com sucesso.`,
  };
}

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshProducts = useCallback(async (showLoader = true) => {
    // Busca a lista mais recente na API e atualiza o estado principal.
    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await getAllProducts();
      setProducts(sortProducts(Array.isArray(data) ? data : []));
      setLastUpdated(new Date());
      setError(null);
    } catch (requestError) {
      console.error("Erro ao carregar produtos:", requestError);
      setError(buildApiErrorFeedback(requestError, "/produtos"));
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Carrega os produtos assim que o hook entra em uso pela primeira vez.
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
    // Cria o produto no backend e atualiza a lista local sem novo reload completo.
    setSaving(true);
    setFeedback(null);

    try {
      const createdProduct = await createProduct(payload);

      setProducts((currentProducts) =>
        sortProducts(upsertProduct(currentProducts, createdProduct)),
      );
      setError(null);

      const nextFeedback = buildSuccessFeedback("create", payload.nome);
      setFeedback(nextFeedback);
      setLastUpdated(new Date());

      return {
        ok: true,
        message: nextFeedback.text,
      };
    } catch (requestError) {
      console.error("Erro ao cadastrar produto:", requestError);
      const nextError = buildApiErrorFeedback(requestError, "/produtos");
      setFeedback({
        type: "error",
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
    // Atualiza um item especifico e substitui a linha correspondente no estado local.
    setSaving(true);
    setFeedback(null);

    try {
      const updatedProduct = await updateProduct(productId, payload);

      setProducts((currentProducts) =>
        sortProducts(upsertProduct(currentProducts, updatedProduct)),
      );
      setError(null);

      const nextFeedback = buildSuccessFeedback("update", payload.nome);
      setFeedback(nextFeedback);
      setLastUpdated(new Date());

      return {
        ok: true,
        message: nextFeedback.text,
      };
    } catch (requestError) {
      console.error("Erro ao atualizar produto:", requestError);
      const nextError = buildApiErrorFeedback(
        requestError,
        `/produtos/${productId}`,
      );
      setFeedback({
        type: "error",
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
    // Remove o item na API e depois limpa a mesma entrada no estado do React.
    setDeleteId(product.id);
    setFeedback(null);

    try {
      await deleteProduct(product.id);
      setProducts((currentProducts) =>
        removeProduct(currentProducts, product.id),
      );
      setError(null);
      setFeedback({
        type: "success",
        text: `"${product.nome}" foi removido do inventario.`,
      });
      setLastUpdated(new Date());
      return true;
    } catch (requestError) {
      console.error("Erro ao excluir produto:", requestError);
      const nextError = buildApiErrorFeedback(
        requestError,
        `/produtos/${product.id}`,
      );
      setFeedback({
        type: "error",
        text: nextError.message,
        hint: nextError.hint,
      });
      return false;
    } finally {
      setDeleteId(null);
    }
  };

  return {
    products: normalizeProducts(products),
    loading,
    saving,
    deleteId,
    error,
    feedback,
    lastUpdated,
    actions: {
      refreshProducts,
      createProduct: handleCreateProduct,
      updateProduct: handleUpdateProduct,
      deleteProduct: handleDeleteProduct,
      clearFeedback: () => setFeedback(null),
    },
  };
}
