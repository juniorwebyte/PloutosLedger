import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={
        <div role="status" aria-live="polite" className="p-4 m-4">
          Carregando...
        </div>
      }>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
