/**
 * Arquivo: src/main.jsx
 * Responsabilidade: ser o ponto de entrada da aplicacao React no navegador.
 * O que voce encontra aqui: montagem do componente principal dentro da div root criada pelo Vite.
 * Dica de manutencao: quase toda mudanca funcional acontece em App.jsx; aqui normalmente so mexemos na inicializacao global.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
