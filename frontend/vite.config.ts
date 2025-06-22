import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react(), nodePolyfills()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'window',
      },
    },
  },
  resolve: {
    alias: {
      'util': 'rollup-plugin-node-polyfills/polyfills/util'
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'esm',
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3002,
    allowedHosts: ['zero-bot.aichallenge.fun'],
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
    allowedHosts: ['zero-bot.aichallenge.fun'],
  }
})