import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa'
import path from 'path'

const manifest: VitePWAOptions['manifest'] = {
  name: 'DriveLog — Teen Driving Hours Tracker',
  short_name: 'DriveLog',
  description: 'Offline-first supervised driving log with DMV-ready PDF export',
  theme_color: '#0f172a',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait-primary',
  scope: '/',
  start_url: '/',
  icons: [
    {
      src: 'pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
}

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: { maxEntries: 10 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'css-cache' },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'font-cache' },
          },
        ],
      },
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
  },
})
