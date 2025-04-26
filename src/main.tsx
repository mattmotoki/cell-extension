import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import { Analytics } from "@vercel/analytics/react"
import { store } from './core/store';
import App from './App'
import '../styles.css' // Import the global styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Analytics />
    </Provider>
  </React.StrictMode>,
) 