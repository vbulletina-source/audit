import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // En CI (GitHub Pages), on peut passer --base=/repo-name/
  const base = process.env.BASE || undefined
  return {
    plugins: [react()],
    base,
  }
})
