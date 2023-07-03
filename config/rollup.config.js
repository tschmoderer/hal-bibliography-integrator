import scss from 'rollup-plugin-scss';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import watch from "rollup-plugin-watch";

const path = require('path');
const fs   = require('fs');
const sass = require('sass');

const InFile = {
    // Main script
    "hal": path.resolve(__dirname, '../src/js/main.js'),
    // Wordcloud plugin
    "hal-wordcloud": path.resolve(__dirname, '../plugins/wordcloud/js/main.js'),
    // Article score plugin 
    "hal-artscore": path.resolve(__dirname, '../plugins/artscore/js/main.js'),
};

export default [
    // MAIN 
    {
        input: InFile,

        output: [
            {
                dir: path.resolve(__dirname, "../dist/"),
                entryFileNames: '[name].js',
                format: 'cjs',
            }, 
            {
                dir: path.resolve(__dirname, "../dist/"),
                entryFileNames: 'assets/js/[name].min.js',
                format: 'cjs',
                plugins: [
                    terser({
                        maxWorkers: 8,
                    }),
                ],
            },
        ],

        treeshake: false,

        plugins: [
            watch({
                dir: path.resolve(__dirname, "../src/"),
            }),

            watch({
                dir: path.resolve(__dirname, "../plugins/")
            }),

            scss({
                output: function (styles, styleNodes) {
                    var n = 0; 
                    for (const key in styleNodes) {
                        const result = sass.compile(key); 
                        const minResult = sass.compile(key, {style: "compressed"}); 

                        const style = Object.keys(InFile)[n];

                        const outputFileName = style + ".css";
                        const outputFilePath = path.resolve(__dirname, `../dist/${outputFileName}`);
                        fs.writeFileSync(outputFilePath, result.css);
                        
                        const outputMinFileName = style + ".min.css";
                        const outpuMinFilePath = path.resolve(__dirname, `../dist/assets/css/${outputMinFileName}`);
                        fs.writeFileSync(outpuMinFilePath, minResult.css);

                        n = n + 1; 
                    }
                },
                include: ["./**/*.css", "./**/*.scss", "./**/*.sass"],
              }), 

              copy({
                targets: [
                  { src: 'dist/assets/js/*.min.js', dest: 'docs/js/' },
                  { src: 'dist/assets/css/*.min.css', dest: 'docs/css/' },
                ]
            }),
        ]
    },
];