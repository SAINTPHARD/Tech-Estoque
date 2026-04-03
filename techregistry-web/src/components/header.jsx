/**
 * Arquivo: src/components/header.jsx
 * Responsabilidade: renderizar um cabecalho simples usado pela versao legada do dashboard.
 * O que voce encontra aqui: titulo do sistema e um botao de saida com estrutura minima.
 * Dica de manutencao: o header principal da aplicacao atual esta montado em App.jsx.
 */

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1>TechRegistry</h1>

        <div className="header-actions">
          <button className="btn-logout">Sair</button>
        </div>
      </div>
    </header>
  );
}
