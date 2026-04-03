/**
 * Arquivo: src/hooks/useActiveSection.js
 * Responsabilidade: controlar qual secao da interface esta ativa.
 * O que voce encontra aqui: leitura inicial da hash da URL e sincronizacao do estado com o navegador.
 * Quando mexer: use este hook quando a logica de navegacao simples mudar.
 */

import { useEffect, useState } from 'react';

function resolveInitialSection(initialSection, allowedSections) {
  // Tenta reaproveitar a hash da URL para manter a mesma pagina em recarregamentos.
  const hashSection = window.location.hash.replace('#', '');

  if (!hashSection) {
    return initialSection;
  }

  if (allowedSections.length && !allowedSections.includes(hashSection)) {
    return initialSection;
  }

  return hashSection;
}

export default function useActiveSection(initialSection = 'dashboard', allowedSections = []) {
  const [activeSection, setActiveSection] = useState(() =>
    resolveInitialSection(initialSection, allowedSections)
  );

  useEffect(() => {
    // Espelha a secao ativa na URL para facilitar navegacao e refresh da pagina.
    window.history.replaceState(null, '', `#${activeSection}`);
  }, [activeSection]);

  return [activeSection, setActiveSection];
}
