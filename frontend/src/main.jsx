import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import router from './routes/index.jsx'
import './index.css'

import { AuthProvider } from './contexts/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#f5f5f5',
            border: '1px solid #333',
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#1a1a1a',
            },
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
)
