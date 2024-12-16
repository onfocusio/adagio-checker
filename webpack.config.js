const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/adagio-checker.js', // Entry point for your frontend code
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output file name
  },
  target: 'node', // Because we have backend code
  externals: [nodeExternals()], // Exclude Node modules
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Transpile modern JavaScript
          },
        },
      },
    ],
  },
};