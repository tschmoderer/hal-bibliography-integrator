import scss from 'rollup-plugin-scss'

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
            buildDelay: 1000,
        },

        treeshake: false,

        plugins: [
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
            buildDelay: 1000,
        },

        treeshake: false,

        plugins: [
            scss({
                fileName: 'hal-wordcloud.css', 
                include: ["./**/*.css", "./**/*.scss", "./**/*.sass"],
            })
        ]
    }
];