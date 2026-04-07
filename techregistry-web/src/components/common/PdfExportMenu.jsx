/**
 * Arquivo: src/components/common/PdfExportMenu.jsx
 * Responsabilidade: renderizar o menu de exportacao em PDF.
 * O que voce encontra aqui: botao principal, lista de formatos e fechamento automatico do menu.
 * Quando mexer: altere este arquivo quando a experiencia de exportacao mudar.
 */

import { ChevronDown, Download, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './PdfExportMenu.css';

export default function PdfExportMenu({ options = [], disabled = false, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    // Fecha o menu quando o usuario clica fora da area de exportacao.
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectOption = (optionId) => {
    onSelect?.(optionId);
    setIsOpen(false);
  };

  return (
    <div className="export-menu" ref={menuRef}>
      <button
        type="button"
        className="secondary-button export-menu-trigger"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <Download size={16} />
        Exportar PDF
        <ChevronDown size={16} className={`export-menu-chevron${isOpen ? ' is-open' : ''}`} />
      </button>

      {isOpen ? (
        <div className="export-menu-panel">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="export-menu-option"
              onClick={() => handleSelectOption(option.id)}
            >
              <span className="export-menu-option-icon">
                <FileText size={16} />
              </span>

              <span className="export-menu-option-copy">
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
