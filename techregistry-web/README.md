# TechRegistry Web

Frontend React + Vite para o painel de estoque do projeto TechRegistry. A interface consome uma API de produtos, exibe indicadores do inventario, permite cadastro e edicao de itens e gera relatorios em PDF.

## Stack

- React 18
- Vite 5
- Axios
- Recharts
- jsPDF + jsPDF AutoTable
- Lucide React

## Scripts

- `npm run dev`: sobe o frontend em modo de desenvolvimento.
- `npm run build`: gera o build de producao na pasta `dist`.
- `npm run preview`: serve localmente o build ja gerado.
- `npm run lint`: executa o ESLint do projeto.

## Variaveis de ambiente

Crie um arquivo `.env` a partir de `.env.example` e ajuste conforme o ambiente:

- `VITE_API_BASE_URL`: base usada pelo Axios. O padrao do projeto e `/api`.
- `VITE_API_PROXY_TARGET`: destino do proxy de desenvolvimento do Vite.
- `VITE_API_TIMEOUT_MS`: timeout das chamadas HTTP em milissegundos.

## Estrutura principal

- `src/App.jsx`: layout base, navegacao entre secoes e integracao com os hooks.
- `src/pages`: paginas de dashboard, estoque e configuracoes.
- `src/components`: componentes visuais reutilizaveis e blocos do dashboard.
- `src/hooks`: hooks com estado e regras de navegacao ou dados.
- `src/services`: configuracao HTTP e servicos que conversam com a API.
- `src/utils`: funcoes auxiliares de produtos, datas, moeda e exportacao.

## Fluxo de dados

1. `useProducts` centraliza a leitura e escrita de produtos.
2. `productService` concentra as chamadas HTTP.
3. `api.js` injeta configuracao comum do Axios e o token JWT quando existir.
4. As paginas consomem os dados normalizados para renderizar cards, tabela, filtros e exportacoes.

## Observacoes

- A geracao de PDF e carregada sob demanda para reduzir o peso inicial do bundle.
- O grafico de categorias tambem foi separado em carregamento lazy para melhorar a experiencia inicial.
- O backend esperado trabalha com os campos `nome`, `categoria`, `preco` e `quantidade`.
