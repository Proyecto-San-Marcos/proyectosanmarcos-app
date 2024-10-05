import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Esto permite que la aplicación esté disponible externamente
    port: 3000,  // Cambia el puerto si lo necesitas
  },
})
