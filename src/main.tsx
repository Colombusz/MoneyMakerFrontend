import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { store } from './store';
import './index.css';

// Enable refetchOnFocus / refetchOnReconnect for RTK Query (dev + prod).
setupListeners(store.dispatch);

// Print the resolved API base URL during development so misconfiguration is
// immediately visible in the console.
if (import.meta.env.DEV) {
  console.log(
    `[api] Dev mode — API requests use Vite proxy → ${import.meta.env.VITE_API_URL || 'http://localhost:4000'}`
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
