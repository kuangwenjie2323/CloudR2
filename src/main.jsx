import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { Provider } from './app/store.jsx'   // ⬅️ 引入 Provider
import './styles/tokens.css'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <Provider>                      {/* ⬅️ 用 Provider 包裹 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)
