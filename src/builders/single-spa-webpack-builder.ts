import { Configuration } from 'webpack';
import { getSystemPath, Path, tags } from '@angular-devkit/core'
import { BuilderContext } from '@angular-devkit/architect';
import * as webpackMerge from 'webpack-merge';

export function buildWebpackConfig(root: Path, config: string, baseWebpackConfig: Configuration, options: any, context: BuilderContext): Configuration {
  const libraryName = options.libraryName || context.targetSpecifier && context.targetSpecifier.project || context.workspace.getDefaultProjectName();

  const singleSpaConfig = {
    output: {
      library: libraryName,
      libraryTarget: options.libraryTarget as any,
    },
    externals: {
      'zone.js': 'Zone',
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

  const customWebpackConfig = config ? require(`${getSystemPath(root)}/${config}`) : {};

  const mergedConfig: any = webpackMerge.smart(baseWebpackConfig, singleSpaConfig, customWebpackConfig);

  removePluginByName(mergedConfig.plugins, 'IndexHtmlWebpackPlugin');
  removeMiniCssExtract(mergedConfig);

  if (Array.isArray(mergedConfig.entry.styles)) {
    // We want the global styles to be part of the "main" entry. The order of strings in this array
    // matters -- only the last item in the array will have its exports become the exports for the entire
    // webpack bundle
    mergedConfig.entry.main = [...mergedConfig.entry.styles, ...mergedConfig.entry.main];
  }

  // Remove bundles
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