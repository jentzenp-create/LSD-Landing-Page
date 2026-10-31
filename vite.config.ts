import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      // Forward serverless API calls to `vercel dev` (run separately on 3001) so the
      // /api/onboarding-chat route works during local Vite development.
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Target modern browsers including Safari 14+
      target: ['es2020', 'safari14', 'ios14'],
      // Enable modulePreload polyfill for Safari
      modulePreload: {
        polyfill: true
      },
      // Optimize chunk splitting for faster Safari loading
      rollupOptions: {
        // Multi-page: the main React site plus the standalone games (arcade, the
        // productized vertical games under games/<slug>), each its own entry so
        // none of them ship in the main site's bundle.
        input: {
          main: path.resolve(__dirname, 'index.html'),
          arcade: path.resolve(__dirname, 'arcade/index.html'),
          coverageGapChallenge: path.resolve(__dirname, 'games/coverage-gap-challenge/index.html'),
          projectFitFinder: path.resolve(__dirname, 'games/project-fit-finder/index.html'),
          fitnessFitCheck: path.resolve(__dirname, 'games/fitness-fit-check/index.html'),
          loanReadinessQuest: path.resolve(__dirname, 'games/loan-readiness-quest/index.html'),
        },
        output: {
          // Minimize number of chunks for Safari (slower with many modules)
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom']
          }
        }
      }
    }
  };
});
