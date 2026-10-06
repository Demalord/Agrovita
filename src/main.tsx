import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import '@fontsource-variable/inter';
import './index.css';
import App from './App';

// En local se usan URLs limpias (/catalogo). La versión publicada como página estática
// se compila con VITE_HASH_ROUTER=true y usa rutas con # (/#/catalogo).
const Router = import.meta.env.VITE_HASH_ROUTER === 'true' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
