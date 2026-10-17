import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      // In local development, proxy /api to the local backend.
      // In production, Vercel rewrites in vercel.json forward /api to Render.
       "/api": {
    target: "https://snitch-co4b.onrender.com",
    changeOrigin: true,
    secure: true,
      },
    },
  },
})
