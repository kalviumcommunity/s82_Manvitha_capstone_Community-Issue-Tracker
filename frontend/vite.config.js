import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <--- Add this
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), // <--- Add this here
    tailwindcss(),
  ],
})