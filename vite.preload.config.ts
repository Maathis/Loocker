import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/preload.ts',
      formats: ['cjs'],
      // Return the basename without extension
      fileName: () => 'preload',
    },
    outDir: '.vite/build',
    rollupOptions: {
      external: ['electron', 'path', 'fs'],
      output: {
        // Ensure extension is `.cjs` for cjs format output
        entryFileNames: '[name].cjs',
      },
    },
  },
});