/**
 * Arquivo: src/utils/productHelpers.js
 * Responsabilidade: reunir funcoes auxiliares ligadas aos produtos.
 * O que voce encontra aqui: normalizacao, ordenacao, filtros, calculos de resumo e leitura de status.
 * Quando mexer: altere este arquivo sempre que surgir uma regra reutilizavel de produto.
 */

// Opcoes reutilizadas nos filtros visuais da tela de estoque.
export const STOCK_STATUS_OPTIONS = [
  { id: "all", label: "Todos" },
  { id: "critical", label: "Critico" },
  { id: "warning", label: "Atencao" },
  { id: "healthy", label: "Saudavel" },
  { id: "neutral", label: "Neutro" },
];

const STOCK_LIMITS = {
  critical: 5,
  warning: 20,
};

// Garante que o produto tenha sempre o mesmo formato antes de entrar na interface.
export function normalizeProduct(product = {}) {
  return {
    ...product,
    nome: typeof product.nome === "string" ? product.nome.trim() : "",
    categoria:
      typeof product.categoria === "string" ? product.categoria.trim() : "",
    preco: Number(product.preco) || 0,
    quantidade: Number(product.quantidade) || 0,
  };
}

// Aplica a normalizacao para uma lista inteira.
export function normalizeProducts(products = []) {
  return products.map(normalizeProduct);
}

export function sortProducts(products = [], sortOption = "recent") {
  // Cria uma copia normalizada antes de ordenar para manter consistencia.
  const normalizedProducts = normalizeProducts(products);

  switch (sortOption) {
    case "name":
      return normalizedProducts.sort((itemA, itemB) =>
        itemA.nome.localeCompare(itemB.nome, "pt-BR"),
      );
    case "stock-asc":
      return normalizedProducts.sort(
        (itemA, itemB) => itemA.quantidade - itemB.quantidade,
      );
    case "stock-desc":
      return normalizedProducts.sort(
        (itemA, itemB) => itemB.quantidade - itemA.quantidade,
      );
    case "value-desc":
      return normalizedProducts.sort(
        (itemA, itemB) =>
          itemB.preco * itemB.quantidade - itemA.preco * itemA.quantidade,
      );
    case "recent":
    default:
      return normalizedProducts.sort(
        (itemA, itemB) => Number(itemB.id) - Number(itemA.id),
      );
  }
}

export function upsertProduct(products = [], nextProduct) {
  // Atualiza um produto existente ou adiciona um novo na lista local.
  const normalizedNextProduct = normalizeProduct(nextProduct);
  const hasExistingProduct = products.some(
    (product) => Number(product.id) === Number(normalizedNextProduct.id),
  );

  if (hasExistingProduct) {
    return products.map((product) =>
      Number(product.id) === Number(normalizedNextProduct.id)
        ? normalizedNextProduct
        : product,
    );
  }

  return [...products, normalizedNextProduct];
}

// Remove da lista o item que possui o ID informado.
export function removeProduct(products = [], productId) {
  return products.filter((product) => Number(product.id) !== Number(productId));
}

export function getStockStatus(input = 0) {
  // Traduz a quantidade numerica ou o produto em um status visual para o usuario.
  const isProduct = typeof input === "object" && input !== null;
  const quantity = isProduct
    ? Number(input.quantidade) || 0
    : Number(input) || 0;
  const statusFlag = isProduct
    ? String(input.status || input.estado || "").toLowerCase()
    : "";

  if (
    [
      "disabled",
      "inactive",
      "in-transit",
      "pending",
      "aguardando conferência",
    ].includes(statusFlag)
  ) {
    return {
      id: "neutral",
      label: "Neutro",
      tone: "neutral",
      description: "Aguardando conferência",
      color: "#475569",
    };
  }

  if (quantity <= STOCK_LIMITS.critical) {
    return {
      id: "critical",
      label: "Critico",
      tone: "critical",
      description: "Reposicao urgente",
      color: "#ef4444",
    };
  }

  if (quantity < STOCK_LIMITS.warning) {
    return {
      id: "warning",
      label: "Atencao",
      tone: "warning",
      description: "Estoque baixo",
      color: "#f59e0b",
    };
  }

  return {
    id: "healthy",
    label: "Saudavel",
    tone: "healthy",
    description: "Nivel confortavel",
    color: "#22c55e",
  };
}

export function buildInventoryStats(products = []) {
  // Calcula os indicadores principais usados pelo dashboard e pela pagina de estoque.
  const normalizedProducts = normalizeProducts(products);
  const totalProducts = normalizedProducts.length;
  const totalUnits = normalizedProducts.reduce(
    (total, product) => total + product.quantidade,
    0,
  );
  const totalValue = normalizedProducts.reduce(
    (total, product) => total + product.preco * product.quantidade,
    0,
  );
  const criticalProducts = normalizedProducts.filter(
    (product) => getStockStatus(product.quantidade).id === "critical",
  ).length;

  return {
    totalProducts,
    totalUnits,
    totalValue,
    criticalProducts,
  };
}

export function buildCategoryOptions(products = []) {
  // Gera as categorias unicas para preencher o select de filtro.
  const options = new Set();

  normalizeProducts(products).forEach((product) => {
    if (product.categoria) {
      options.add(product.categoria);
    }
  });

  return [...options]
    .sort((itemA, itemB) => itemA.localeCompare(itemB, "pt-BR"))
    .map((categoria) => ({
      id: categoria.toLowerCase(),
      label: categoria,
      value: categoria,
    }));
}

export function buildCategoryChartData(products = []) {
  // Agrupa os produtos por categoria para alimentar o grafico.
  const categoryMap = new Map();

  normalizeProducts(products).forEach((product) => {
    const category = product.categoria || "Sem categoria";
    const currentGroup = categoryMap.get(category) || {
      categoria: category,
      quantidadeProdutos: 0,
      totalUnidades: 0,
    };

    categoryMap.set(category, {
      categoria: category,
      quantidadeProdutos: currentGroup.quantidadeProdutos + 1,
      totalUnidades: currentGroup.totalUnidades + product.quantidade,
    });
  });

  return [...categoryMap.values()]
    .sort(
      (itemA, itemB) =>
        itemB.quantidadeProdutos - itemA.quantidadeProdutos ||
        itemA.categoria.localeCompare(itemB.categoria, "pt-BR"),
    )
    .slice(0, 6);
}

export function filterProducts(
  products = [],
  { searchTerm = "", categoryFilter = "all", stockFilter = "all" } = {},
) {
  // Aplica busca por nome, filtro por categoria e filtro por status em uma unica passada.
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return normalizeProducts(products).filter((product) => {
    const matchesSearch = normalizedSearch
      ? product.nome.toLowerCase().includes(normalizedSearch)
      : true;
    const matchesCategory =
      categoryFilter === "all"
        ? true
        : product.categoria.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus =
      stockFilter === "all"
        ? true
        : getStockStatus(product.quantidade).id === stockFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });
}
