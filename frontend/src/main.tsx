import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupApiFetchInterceptor } from './config/fetchInterceptor'
import './index.css'
import App from './App'

setupApiFetchInterceptor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
