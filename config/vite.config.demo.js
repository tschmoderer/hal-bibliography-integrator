import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: resolve(__dirname, '../demo'),
    base: "/hal-bibliography-integrator/",

    build: {
        outDir: resolve(__dirname, '../docs'),
        emptyOutDir: true,

        // rollupOptions: {
        //     input: {
        //         main: resolve(__dirname, '../demo/index.html'),
        //     },
        // },
    },

    // // 5. Ensure your demo can resolve the library source code
    // resolve: {
    //     alias: {
    //         '@lib': resolve(__dirname, '../src/js/main.js'),
    //     },
    // },
});