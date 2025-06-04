import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['5550-2405-201-200e-b0fc-7d8d-539e-e2a8-6d67.ngrok-free.app'],
  },
})
