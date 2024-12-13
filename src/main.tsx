import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/inter/100.css'; // ExtraThin
import '@fontsource/inter/200.css'; // Thin
import '@fontsource/inter/300.css'; // Light
import '@fontsource/inter/400.css'; // Regular
import '@fontsource/inter/500.css'; // Medium
import '@fontsource/inter/600.css'; // Semibold
import '@fontsource/inter/700.css'; // Bold
import '@fontsource/inter/800.css'; // ExtraBold
import '@fontsource/inter/900.css'; // Black
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);