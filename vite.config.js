import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.html'],
  server: {
    port: 5173,
    open: true
  }
})
