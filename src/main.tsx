import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { TamaguiProvider } from 'tamagui';
import { Analytics } from "@vercel/analytics/react"
import config from '../tamagui.config';
import App from './App';
import { store } from './core/store';

// Minimal polyfills for React Native Web and Tamagui
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Create root and render app
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <TamaguiProvider config={config} defaultTheme="light">
        <App />
        <Analytics />
      </TamaguiProvider>
    </Provider>
  </React.StrictMode>
); 