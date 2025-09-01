import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'; // Importe o BrowserRouter
import { ThemeProvider } from './contexts/ThemeContext'; // Importe o ThemeProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider> {/* Envolve toda a aplicação com o ThemeProvider */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}> {/* Envolva o App com o BrowserRouter */}
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
