import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5174,
    allowedHosts: ['7fd1da28619c.ngrok-free.app', '.ngrok.io', '.ngrok-free.app'],
    disableHostCheck: true, // Disable host checking for development
  },
})
