import * as webpackMerge from 'webpack-merge';
import * as path from 'path'

export default (config, options) => {
  const singleSpaConfig = {
    output: {
      library: 'app3',
      libraryTarget: 'umd',
    },
    externals: {
      'zone.js': 'Zone',
    },
    devServer: {
      historyApiFallback: false,
      contentBase: path.resolve(process.cwd(), 'src'),
      headers: {
          'Access-Control-Allow-Headers': '*',
      },
    },
    module: {
      rules: [
        {
          parser: {
            system: false
          }
        }
      ]
    }
  }

  // @ts-ignore
  const mergedConfig: any = webpackMerge.smart(config, singleSpaConfig)

  removePluginByName(mergedConfig.plugins, 'IndexHtmlWebpackPlugin');
  removeMiniCssExtract(mergedConfig);

  if (Array.isArray(mergedConfig.entry.styles)) {
    // We want the global styles to be part of the "main" entry. The order of strings in this array
    // matters -- only the last item in the array will have its exports become the exports for the entire
    // webpack bundle
    mergedConfig.entry.main = [...mergedConfig.entry.styles, ...mergedConfig.entry.main];
  }

  // Remove bundles

  // Since Angular 8 supports differential loading it also
  // add `polyfills-es5` to Webpack entries. This is a fix for:
  // https://github.com/single-spa/single-spa-angular/issues/148
  if (mergedConfig.entry['polyfills-es5']) {
    delete mergedConfig.entry['polyfills-es5'];
  }

  delete mergedConfig.entry.polyfills;
  delete mergedConfig.entry.styles;
  delete mergedConfig.optimization.runtimeChunk;
  delete mergedConfig.optimization.splitChunks;

  return mergedConfig;
}

function removePluginByName(plugins, name) {
  const pluginIndex = plugins.findIndex(plugin => plugin.constructor.name === name);
  if (pluginIndex > -1) {
    plugins.splice(pluginIndex, 1);
  }
}

function removeMiniCssExtract(config) {
  removePluginByName(config.plugins, 'MiniCssExtractPlugin');
  config.module.rules.forEach(rule => {
    if (rule.use) {
      const cssMiniExtractIndex = rule.use.findIndex(use => typeof use === 'string' && use.includes('mini-css-extract-plugin'));
      if (cssMiniExtractIndex >= 0) {
        rule.use[cssMiniExtractIndex] = {loader: 'style-loader'}
      }
    }
  });
}
