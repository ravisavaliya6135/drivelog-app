import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa'
import path from 'path'

const manifest: VitePWAOptions['manifest'] = {
  name: 'DriveHours — Teen Driving Log',
  short_name: 'DriveHours',
  description: 'Offline-first supervised driving log with DMV-ready PDF export and legal sunset detection',
  theme_color: '#0F172A',
  background_color: '#0F172A',
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

export default defineConfig(({ mode }) => {
  // Minimal config for the SSG prerender step (`vite build --ssr --mode prerender`):
  // builds ONLY the state-guide SSR renderer to Node-friendly output.
  // No PWA plugin, no manual chunking, no console stripping.
  if (mode === 'prerender') {
    return {
      base: '/',
      plugins: [react()],
      build: {
        target: 'esnext',
        outDir: 'dist-ssr',
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: 'state-guide-ssr.js',
          },
        },
      },
    };
  }

  return {
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
          // Prerendered SEO pages are served statically and cached at runtime
          // (NetworkFirst document strategy below) instead of being precached,
          // keeping the offline bundle small.
          globIgnores: ['dmv/**/*.html'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'css-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'font-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
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
  };
});
