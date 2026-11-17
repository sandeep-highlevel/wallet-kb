/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Relative base: the site is served from a GitHub Pages project path, and routing is
// hash-based, so every asset URL must resolve relative to index.html.
export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
  // The KB data (flows, surfaces, collections) is bundled JSON; one ~210 kB gzip chunk is expected.
  build: { chunkSizeWarningLimit: 1000 },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts']
  }
})
