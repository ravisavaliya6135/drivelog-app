import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Immediate service worker registration for PWA installability & offline support
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[DriveLog PWA] 🔄 Service worker update ready');
  },
  onOfflineReady() {
    console.log('[DriveLog PWA] 📶 App ready to work offline');
  },
  onRegistered(registration) {
    console.log('[DriveLog PWA] ⚙️ Service worker registered successfully:', registration);
  },
  onRegisterError(error) {
    console.error('[DriveLog PWA] ❌ Service worker registration failed:', error);
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
