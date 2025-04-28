import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import { Analytics } from "@vercel/analytics/react"
import { store } from './core/store';
import App from './App'
// Import styles and apply theme to CSS variables
import { applyThemeToCSS } from '@web/styles';

// Apply theme values to CSS variables
applyThemeToCSS();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Analytics />
    </Provider>
  </React.StrictMode>,
) 