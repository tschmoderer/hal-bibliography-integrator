import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        root: resolve(__dirname, '../demo'),

        build: {
            outDir: resolve(__dirname, '../dist'),
            emptyOutDir: true,

            minify: !isDev,
            sourcemap: false,
            cssCodeSplit: true,

            lib: {
                entry: {
                    'hal-bibliography-integrator': resolve(import.meta.dirname, '../src/js/main.js'),
                    'hal-bibliography-integrator-wordcloud': resolve(import.meta.dirname, '../src/plugins/wordcloud/js/main.js'),
                    'hal-bibliography-integrator-artscore': resolve(import.meta.dirname, '../src/plugins/artscore/js/main.js'),
                    'hal-bibliography-integrator-charts': resolve(import.meta.dirname, '../src/plugins/charts/js/main.js'),
                },
                formats: ["cjs"],
                fileName: (format, entryName) => `${entryName}${isDev ? '' : '.min'}.${format}`,
            },
        },

        css: {
            devSourcemap: isDev
        }
    };
});