import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        lib: {
          entry: 'src/main.ts',
          formats: ['cjs'],               // Output CommonJS format
          fileName: () => 'main.cjs',    // Output filename is main.cjs
        },
        outDir: '.vite/build',
        rollupOptions: {
          external: ['electron'],         // Electron modules stay external
        },
    },
});
