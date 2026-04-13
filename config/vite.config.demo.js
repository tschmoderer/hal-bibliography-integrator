import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, '../demo'),
    base: "/hal-bibliography-integrator/",

    build: {
        outDir: resolve(__dirname, '../docs'),
        emptyOutDir: true,
    },
});