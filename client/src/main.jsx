// main.jsx — Entry point of the React app
// This file mounts the App component into the HTML page.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // Tailwind styles
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
