import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { Server } from 'lucide-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    Server:{port:5173}
    },
  },
})