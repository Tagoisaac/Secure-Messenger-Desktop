import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/preload/preload.ts',
      formats: ['cjs'],
      fileName: 'preload',
    },
    outDir: 'dist/preload',
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
