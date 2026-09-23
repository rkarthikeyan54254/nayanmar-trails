import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const publicSiteUrl = (process.env.PUBLIC_SITE_URL || 'https://nayanmartrails.netlify.app').replace(/\/$/, '');

export default defineConfig({
  plugins: [react()],
  define: {
    __PUBLIC_SITE_URL__: JSON.stringify(publicSiteUrl),
  },
  build: { sourcemap: true },
});
