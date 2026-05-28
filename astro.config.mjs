import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://biczak.dev',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: 'lightningcss' },
  },
});
