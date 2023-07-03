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
    "hal-wordcloud": path.resolve(__dirname, '../src/plugins/wordcloud/js/main.js'),
    // Article score plugin 
    "hal-artscore": path.resolve(__dirname, '../src/plugins/artscore/js/main.js'),
};

export default [
    // MAIN 
    {
        input: InFile,

        output: [
            {
                dir: path.resolve(__dirname, "../dist/js"),
                entryFileNames: '[name].js',
                format: 'cjs',
            }, 
            /*
            // Cannot minify because plugins use the variables of the main script. 
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
            */
        ],

        treeshake: false,

        plugins: [
            watch({
                dir: path.resolve(__dirname, "../src/"),
            }),

            scss({
                output: function (styles, styleNodes) {
                    var n = 0; 
                    for (const key in styleNodes) {
                        // compile sass files 
                        const result = sass.compile(key); 
                        const minResult = sass.compile(key, {style: "compressed"}); 

                        // look for which file we have compiled
                        var style = "";  
                        for (const s in InFile) {
                            const relative = path.relative(path.dirname(path.dirname(key)), InFile[s]);
                            if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
                                style = s; 
                                break;
                            }
                        }
                        
                        const outputFileName = style + ".css";
                        const outputFilePath = path.resolve(__dirname, `../dist/css/${outputFileName}`);
                        if (!fs.existsSync(path.dirname(outputFilePath))){
                            fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
                        }
                        fs.writeFileSync(outputFilePath, result.css);
                        
                        const outputMinFileName = style + ".min.css";
                        const outpuMinFilePath = path.resolve(__dirname, `../dist/css/${outputMinFileName}`);
                        if (!fs.existsSync(path.dirname(outpuMinFilePath))){
                            fs.mkdirSync(path.dirname(outpuMinFilePath), { recursive: true });
                        }
                        fs.writeFileSync(outpuMinFilePath, minResult.css);

                        n = n + 1; 
                        //console.log([key, path.dirname(path.dirname(key)), style, outputFilePath, outpuMinFilePath]);
                    }
                },
                include: ["./**/*.css", "./**/*.scss", "./**/*.sass"],
              }), 

              copy({
                targets: [
                  { src: 'dist/js/*.js', dest: 'docs/assets/js/' },
                  { src: 'dist/css/*.min.css', dest: 'docs/assets/css/' },
                ]
            }),
        ]
    },
];