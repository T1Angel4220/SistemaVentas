import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Asegurar que el build de producción sea consistente
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Mantener nombres de funciones para mejor debugging
        manualChunks: undefined,
      },
    },
  },
})
