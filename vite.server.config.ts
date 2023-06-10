import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    ssr: true,
    // even though we are not using ssr functionality
    // we need vite to realize this is server build
    assetsDir: '',
    copyPublicDir: false,
    rollupOptions: {
      output: {
        format: 'cjs',
        entryFileNames: 'main.js',
        chunkFileNames: 'server-chunk-[hash].js'
      },
      input: {
        main: './src/server/main.ts'
      }
    }
  }
})
