const path = require('path');

export default {
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
};