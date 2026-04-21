import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles.css'; // keep ONLY if you really need it
import App from './App';
import reportWebVitals from './reportWebVitals';

// OPTIONAL: force dark mode persistence
if (localStorage.theme === 'dark' || 
   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();