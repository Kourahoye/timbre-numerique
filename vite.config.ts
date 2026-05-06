import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
//server alowed web site https://swimmer-bullwhip-rearview.ngrok-free.dev 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["swimmer-bullwhip-rearview.ngrok-free.dev"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
