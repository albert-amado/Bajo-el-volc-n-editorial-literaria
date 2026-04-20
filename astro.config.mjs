import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    ssr: {
      external: ['aos'],
    },
  },
});
