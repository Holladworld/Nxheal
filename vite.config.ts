import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Keep built asset URLs relative so NxHeal can run at a domain root or
  // under a repository/project subpath (for example, GitHub Pages).
  base: './',
  plugins: [react()],
});
