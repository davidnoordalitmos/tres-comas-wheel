import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/tres-comas-wheel/', // Set base for GitHub Pages deployment
  plugins: [react()],
})
