import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import type { Plugin } from 'vite';

/**
 * Custom Vite plugin: removes `crossorigin` attributes from <script> and <link> tags
 * in the generated index.html. Android's Capacitor WebView (`https://localhost` or
 * `capacitor://localhost`) blocks local script/CSS loading when CORS is enforced.
 */
function removeCrossorigin(): Plugin {
  return {
    name: 'remove-crossorigin',
    enforce: 'post',
    transformIndexHtml(html: string) {
      return html.replace(/\s*crossorigin\b/gi, '');
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // CRITICAL: Relative paths for Android WebView asset loading.
    // Without this, index.html uses `/assets/` which fails in file:// or capacitor:// protocols.
    base: './',

    plugins: [
      react(), 
      tailwindcss(),
      removeCrossorigin(),
      // PWA removed — Capacitor handles native app lifecycle, PWA service workers
      // conflict with native WebView navigation and cause caching issues.
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // No aggressive code splitting — keep chunks simple to reduce
      // module loading failure points in Android WebView.
      rollupOptions: {
        output: {
          // Single vendor chunk only, no fine-grained splitting
          manualChunks: undefined,
        },
      },
      chunkSizeWarningLimit: 1500,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
