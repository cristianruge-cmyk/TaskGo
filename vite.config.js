import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fuerza a Vite a usar el PostCSS config local
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    // Opcional: si quieres quitar el overlay rojo mientras depuras
    // hmr: { overlay: false },
  },
})
