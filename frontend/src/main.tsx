import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Asegurar que el DOM esté completamente cargado antes de montar la aplicación
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Verificar que window.location esté disponible
if (typeof window === 'undefined' || !window.location) {
  throw new Error('Window location is not available');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
