/**
 * Arquivo: src/components/layout/SidebarItem.jsx
 * Responsabilidade: representar uma unica opcao navegavel dentro do menu lateral.
 * O que voce encontra aqui: renderizacao de icone, rotulo e estado ativo de cada item do sidebar.
 * Dica de manutencao: altere este arquivo quando o comportamento visual dos itens do menu precisar mudar.
 */

export default function SidebarItem({ item, isActive, onSelect }) {
  const Icon = item.icon;

  // Mantem cada item do menu mais enxuto para seguir a referencia visual enviada.
  return (
    <button
      type="button"
      className={`sidebar-item${isActive ? ' is-active' : ''}`}
      onClick={() => onSelect(item.id)}
    >
      <span className="sidebar-item-icon">
        <Icon size={18} />
      </span>

      <span className="sidebar-item-copy">
        <strong>{item.label}</strong>
      </span>
    </button>
  );
}
