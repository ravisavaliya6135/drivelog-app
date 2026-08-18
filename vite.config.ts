import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa'
import path from 'path'

const manifest: VitePWAOptions['manifest'] = {
  name: 'DriveLog',
  short_name: 'DriveLog',
  description: 'Offline-first supervised driving log with DMV-ready PDF export',
  theme_color: '#0D9488',
  background_color: '#F8FAFC',
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

export default defineConfig(({ mode }) => ({
  base: '/',
  // Strip console/debugger from production bundles; keep them in dev for debugging
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
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
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'image-cache' },
          },
        ],
      },
      includeAssets: ['favicon.svg', 'robots.txt', 'pwa-192x192.png', 'pwa-512x512.png'],
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
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'pdf': ['@react-pdf/renderer'],
        },
      },
    },
  },
}))
