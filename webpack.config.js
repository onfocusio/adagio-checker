const path = require('path');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'script.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    target: ['web', 'es2020'], // Ensure modern syntax is supported
};