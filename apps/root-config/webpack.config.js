const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, { mode }) => {
  const isDevelopment = mode !== 'production';

  /** @type {import('webpack').Configuration} */
  const config = {
    entry: path.join(__dirname, 'src/main.js'),
    output: {
      clean: true,
      publicPath: '/',
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      path: path.join(__dirname, '../../dist/apps/root-config'),
    },
    target: 'web',
    mode: isDevelopment ? 'development' : 'production',
    plugins: [
      new HtmlWebpackPlugin({
        isDevelopment,
        minify: !isDevelopment,
        template: path.join(__dirname, 'src/index.ejs'),
      }),
    ],
    devServer: {
      port: 8080,
      hot: false,
      liveReload: false,
      historyApiFallback: true,
    },
  };

  return config;
};
