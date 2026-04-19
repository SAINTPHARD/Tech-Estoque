/**
 * Arquivo: src/utils/productImport.js
 * Responsabilidade: ler arquivos CSV ou JSON e transformar em produtos validos.
 */

const FIELD_ALIASES = {
  nome: ['nome', 'name', 'produto', 'product', 'descricao', 'description'],
  categoria: ['categoria', 'category', 'tipo', 'grupo', 'group'],
  preco: ['preco', 'preco unitario', 'price', 'valor', 'value'],
  quantidade: ['quantidade', 'qtd', 'qty', 'estoque', 'stock'],
};

function normalizeHeader(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseLocalizedNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  let safeValue = String(value ?? '').trim();

  if (!safeValue) {
    return Number.NaN;
  }

  if (safeValue.includes(',') && safeValue.includes('.')) {
    if (safeValue.lastIndexOf(',') > safeValue.lastIndexOf('.')) {
      safeValue = safeValue.replace(/\./g, '').replace(',', '.');
    } else {
      safeValue = safeValue.replace(/,/g, '');
    }
  } else if (safeValue.includes(',')) {
    safeValue = safeValue.replace(',', '.');
  }

  return Number(safeValue);
}

function parseCsvLine(line, delimiter) {
  const cells = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === delimiter && !insideQuotes) {
      cells.push(currentCell.trim());
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  cells.push(currentCell.trim());
  return cells;
}

function mapCsvHeaders(headerRow) {
  const mapping = {};

  headerRow.forEach((header, index) => {
    const normalizedHeader = normalizeHeader(header);

    Object.entries(FIELD_ALIASES).forEach(([fieldName, aliases]) => {
      if (!mapping[fieldName] && aliases.includes(normalizedHeader)) {
        mapping[fieldName] = index;
      }
    });
  });

  return mapping;
}

function buildImportedProduct(rawProduct = {}) {
  return {
    nome: String(rawProduct.nome ?? '').trim(),
    categoria: String(rawProduct.categoria ?? '').trim(),
    preco: parseLocalizedNumber(rawProduct.preco),
    quantidade: Number.parseInt(rawProduct.quantidade, 10),
  };
}

function isValidImportedProduct(product) {
  return (
    Boolean(product.nome) &&
    Boolean(product.categoria) &&
    Number.isFinite(product.preco) &&
    product.preco > 0 &&
    Number.isInteger(product.quantidade) &&
    product.quantidade >= 0
  );
}

function parseJsonProducts(text) {
  const parsed = JSON.parse(text);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed?.produtos)) {
    return parsed.produtos;
  }

  if (Array.isArray(parsed?.products)) {
    return parsed.products;
  }

  throw new Error('O JSON precisa conter um array de produtos.');
}

function parseCsvProducts(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('O CSV precisa ter cabecalho e pelo menos uma linha de dados.');
  }

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headerRow = parseCsvLine(lines[0], delimiter);
  const headerMap = mapCsvHeaders(headerRow);

  if (
    headerMap.nome == null ||
    headerMap.categoria == null ||
    headerMap.preco == null ||
    headerMap.quantidade == null
  ) {
    throw new Error(
      'O arquivo CSV precisa mapear as colunas nome, categoria, preco e quantidade.',
    );
  }

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line, delimiter);

    return {
      nome: cells[headerMap.nome],
      categoria: cells[headerMap.categoria],
      preco: cells[headerMap.preco],
      quantidade: cells[headerMap.quantidade],
    };
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Nao foi possivel ler o arquivo selecionado.'));
    reader.readAsText(file);
  });
}

function resolveRawProducts(text, fileName = '') {
  const normalizedName = fileName.toLowerCase();
  const looksLikeJson =
    normalizedName.endsWith('.json') ||
    text.trim().startsWith('[') ||
    text.trim().startsWith('{');

  return looksLikeJson ? parseJsonProducts(text) : parseCsvProducts(text);
}

export async function parseImportedProductsFile(file) {
  const fileText = await readFileAsText(file);
  const rawProducts = resolveRawProducts(fileText, file?.name);

  const validProducts = [];
  let skippedCount = 0;

  rawProducts.forEach((rawProduct) => {
    const product = buildImportedProduct(rawProduct);

    if (isValidImportedProduct(product)) {
      validProducts.push(product);
      return;
    }

    skippedCount += 1;
  });

  if (!validProducts.length) {
    throw new Error(
      'Nenhum produto valido foi encontrado. Revise nome, categoria, preco e quantidade no arquivo.',
    );
  }

  return {
    products: validProducts,
    skippedCount,
    sourceName: file?.name || 'arquivo selecionado',
  };
}
