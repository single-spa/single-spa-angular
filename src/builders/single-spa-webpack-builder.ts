import { Configuration } from 'webpack';
import { getSystemPath, Path, tags } from '@angular-devkit/core'
import { BuilderContext } from '@angular-devkit/architect';
import * as webpackMerge from 'webpack-merge';

export function buildWebpackConfig(root: Path, config: string, baseWebpackConfig: Configuration, options: any, context: BuilderContext): Configuration {
  const libraryName = options.libraryName || context.targetSpecifier && context.targetSpecifier.project;

  const singleSpaConfig = {
    output: {
      library: libraryName,
      libraryTarget: options.libraryTarget as any,
    },
    externals: {
      'zone.js': 'Zone',
    }
  }

  const customWebpackConfig = config ? require(`${getSystemPath(root)}/${config}`) : {};

  const mergedConfig: any = webpackMerge.smart(baseWebpackConfig, singleSpaConfig, customWebpackConfig);

  const indexHtmlWebpackPluginIndex = mergedConfig.plugins.findIndex(
    plugin => (plugin as any).constructor.name === 'IndexHtmlWebpackPlugin',
  );

  if (indexHtmlWebpackPluginIndex > -1) {
    mergedConfig.plugins.splice(indexHtmlWebpackPluginIndex, 1);
  }

  // Remove bundles
  delete mergedConfig.entry.polyfills;
  delete mergedConfig.entry.styles;
  delete mergedConfig.optimization.runtimeChunk;
  delete mergedConfig.optimization.splitChunks;

  return mergedConfig;
}