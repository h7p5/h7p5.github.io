import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sitePages } from './seo-plugin.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sitePages()],
})
