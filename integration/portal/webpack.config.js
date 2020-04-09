const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  output: {
    publicPath: '/',
    filename: 'portal.js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin()],
  devServer: {
    port: 8080,
    historyApiFallback: true,
  },
};
