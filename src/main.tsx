import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ReviewerDemo from './ReviewerDemo';
import './styles.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // The app remains usable online if service-worker setup is unavailable.
    });
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('NxHeal could not find the application root element.');
}

const isReviewerDemo = new URLSearchParams(window.location.search).get('view') === 'reviewer-demo';

createRoot(rootElement).render(
  <StrictMode>
    {isReviewerDemo ? <ReviewerDemo /> : <App />}
  </StrictMode>,
);