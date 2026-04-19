/**
 * Arquivo: src/pages/Settings.jsx
 * Responsabilidade: exibir um resumo tecnico do ambiente do frontend.
 * O que voce encontra aqui: configuracoes da API, estado da sessao e checklist de operacao.
 * Quando mexer: altere esta pagina quando os metadados tecnicos da aplicacao mudarem.
 */

import { CircleHelp, LogIn } from 'lucide-react';
import { apiRuntimeConfig } from '../services/api';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDateTime } from '../utils/datePicker';
import { buildInventoryStats } from '../utils/productHelpers';

export default function Settings({
  products,
  loading,
  isAuthenticated = false,
  operatorLogin = '',
  onRefresh,
  onOpenLogin,
  onOpenHelp,
}) {
  const stats = buildInventoryStats(products);

  return (
    <section className="page-shell">
      <div className="page-lead">
        <div>
          <span className="page-kicker">Ambiente</span>
          <h2>Resumo tecnico da aplicacao</h2>
          <p>Esta pagina concentra integracao, sessao do operador e atalhos de suporte.</p>
        </div>

        <div className="page-lead-actions">
          <button type="button" className="secondary-button" onClick={() => onOpenHelp?.()}>
            <CircleHelp size={16} />
            Ajuda
          </button>

          <button type="button" className="secondary-button" onClick={() => onOpenLogin?.()}>
            <LogIn size={16} />
            {isAuthenticated ? 'Trocar sessao' : 'Entrar'}
          </button>

          <button type="button" className="secondary-button" onClick={() => onRefresh?.()}>
            Atualizar dados
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <article className="settings-card">
          <span>Base URL</span>
          <strong>{apiRuntimeConfig.baseURL}</strong>
          <p>Endereco usado pelo Axios no frontend.</p>
        </article>

        <article className="settings-card">
          <span>Proxy local</span>
          <strong>{apiRuntimeConfig.proxyTarget}</strong>
          <p>Destino usado no desenvolvimento com Vite.</p>
        </article>

        <article className="settings-card">
          <span>Timeout</span>
          <strong>{apiRuntimeConfig.timeout} ms</strong>
          <p>Tempo maximo antes de considerar falha na requisicao.</p>
        </article>

        <article className="settings-card">
          <span>Produtos carregados</span>
          <strong>{loading ? '...' : stats.totalProducts}</strong>
          <p>Quantidade atual recebida da API.</p>
        </article>

        <article className="settings-card">
          <span>Sessao do operador</span>
          <strong>{isAuthenticated ? operatorLogin || 'Autenticado' : 'Nao autenticado'}</strong>
          <p>POST, PUT e DELETE exigem login valido no backend.</p>
        </article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Checklist</span>
            <h3>Configuracao observada agora</h3>
            <p>Use este bloco como referencia antes de subir para o git ou empacotar com Docker.</p>
          </div>
        </div>

        <div className="settings-stack">
          <div className="settings-line">
            <strong>Ultima leitura da interface</strong>
            <span>{formatDateTime()}</span>
          </div>

          <div className="settings-line">
            <strong>Proxy de desenvolvimento ativo</strong>
            <span>{apiRuntimeConfig.usesDevProxy ? 'Sim' : 'Nao'}</span>
          </div>

          <div className="settings-line">
            <strong>Campos mapeados no frontend</strong>
            <span>nome, categoria, preco, quantidade</span>
          </div>

          <div className="settings-line">
            <strong>Valor total em estoque</strong>
            <span>{formatCurrency(stats.totalValue)}</span>
          </div>

          <div className="settings-line">
            <strong>Fluxo de importacao</strong>
            <span>Dashboard aceita CSV ou JSON e sincroniza automaticamente.</span>
          </div>
        </div>
      </section>
    </section>
  );
}
