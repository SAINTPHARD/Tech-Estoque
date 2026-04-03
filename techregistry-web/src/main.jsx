/**
 * Arquivo: src/main.jsx
 * Responsabilidade: iniciar o React no navegador.
 * O que voce encontra aqui: ponto de entrada da aplicacao e importacao do CSS global.
 * Quando mexer: normalmente so muda quando a inicializacao geral do projeto muda.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
