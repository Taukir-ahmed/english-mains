import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({command})=>({
  plugins: [tailwindcss()],
  base: './',
  define: {'process.env.NODE_ENV':JSON.stringify(command==='build'?'production':'development')},
  esbuild: { jsx: 'automatic' },
  build: {
    lib: { entry: 'src/main.jsx', name: 'EnglishPractice', formats: ['iife'], fileName: () => 'practice.js',cssFileName:'practice' },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
}));
