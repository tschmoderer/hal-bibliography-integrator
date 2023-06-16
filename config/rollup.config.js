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
            include: path.resolve(__dirname, "../src/js/*")
        },

        treeshake: false,
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
            include: path.resolve(__dirname, "../plugins/wordcloud/js/*")
        },

        treeshake: false,
    }
];