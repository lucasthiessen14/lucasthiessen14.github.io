import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { UiModeProvider } from './context/UiModeContext';
import './styles/styles.scss';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root element');
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <UiModeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </UiModeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
