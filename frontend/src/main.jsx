import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, Router, RouterProvider } from 'react-router-dom'
import router from './routes/index.jsx'
import './index.css'

import { AuthProvider } from './contexts/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)