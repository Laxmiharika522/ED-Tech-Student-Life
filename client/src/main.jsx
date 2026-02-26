import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: { fontFamily:"'Inter',sans-serif", fontSize:'0.875rem', background:'#161d2b', color:'#fff', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 16px' },
        success: { iconTheme:{ primary:'#22c55e', secondary:'#fff' } },
        error:   { iconTheme:{ primary:'#ef4444', secondary:'#fff' } },
      }}/>
    </BrowserRouter>
  </React.StrictMode>
)
