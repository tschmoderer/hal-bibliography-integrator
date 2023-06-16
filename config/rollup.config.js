import scss from 'rollup-plugin-scss'
import watchGlobs from 'rollup-plugin-watch-globs';

const path = require('path');

export default [
    // MAIN 
    {
        input: path.resolve(__dirname, '../src/js/main.js'),

        output: [
            {
                file: path.resolve(__dirname, "../dist/hal.js"),
                format: 'cjs',
            },
        ],

        watch: {
            include: [
                path.resolve(__dirname, "../src/js/*"),
                path.resolve(__dirname, "../src/scss/*")
            ],
            buildDelay: 2000,
        },

        treeshake: false,

        plugins: [
            watchGlobs([
                "./**/*.css", 
                "./**/*.scss", 
                "./**/*.sass"
            ]),
            scss({
                fileName: 'hal.css', 
                include: ["./**/*.css", "./**/*.scss", "./**/*.sass"],
            })
        ]
    }, 
    
    // WORDCLOUD
    {
        input: path.resolve(__dirname, '../plugins/wordcloud/js/main.js'),

        output: [
            {
                file: path.resolve(__dirname, "../dist/plugings/wordcloud/hal-wordcloud.js"),
                format: 'cjs',
            },
        ],

        watch: {
            include: [
                path.resolve(__dirname, "../plugins/wordcloud/js/*"),
                path.resolve(__dirname, "../plugins/wordcloud/scss/*")
            ], 
            buildDelay: 2000,
        },

        treeshake: false,

        plugins: [
            watchGlobs([
                "./**/*.css", 
                "./**/*.scss", 
                "./**/*.sass"
            ]),
            scss({
                fileName: 'hal-wordcloud.css', 
                include: ["./**/*.css", "./**/*.scss", "./**/*.sass"],
            })
        ]
    },

    // SCIMAGO
    {
        input: path.resolve(__dirname, '../plugins/scimago/js/main.js'),

        output: [
            {
                file: path.resolve(__dirname, "../dist/plugings/scimago/hal-scimago.js"),
                format: 'cjs',
            },
        ],

        watch: {
            include: [
                path.resolve(__dirname, "../plugins/scimago/js/*"),
                path.resolve(__dirname, "../plugins/scimago/scss/*")
            ], 
            buildDelay: 2000,
        },

        treeshake: false,

        plugins: [
            watchGlobs([
                "./**/*.css", 
                "./**/*.scss", 
                "./**/*.sass"
            ]),
            scss({
                fileName: 'hal-scimago.css', 
                include: ["./**/*.css", "./**/*.scss", "./**/*.sass"],
            })
        ]
    }
];