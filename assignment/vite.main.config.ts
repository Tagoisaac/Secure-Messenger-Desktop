import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main/index.ts',
      formats: ['cjs'],
      fileName: 'index',
    },
    outDir: 'dist/main',
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron', 'better-sqlite3', 'ws'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
