import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/wdth.css'
import '@fontsource-variable/dm-sans/opsz.css'
import './index.css'
import { Toaster } from 'sileo'
import 'sileo/styles.css'
import App from './App.tsx'
import { AuthProvider } from './auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" theme="system" />
    </AuthProvider>
  </StrictMode>,
)
