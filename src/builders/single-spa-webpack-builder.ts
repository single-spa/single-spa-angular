import { Configuration } from 'webpack';
import { getSystemPath, Path, tags } from '@angular-devkit/core'
import { BuilderContext } from '@angular-devkit/architect';
import * as webpackMerge from 'webpack-merge';
import { SingleSpaWepackServerConfig} from './single-spa-webpack-server-config';

export class SingleSpaWebpackBuilder {
  static buildWebpackConfig(root: Path,
    config: string,
    baseWebpackConfig: Configuration,
    options: any,
    context: BuilderContext): Configuration {

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
  static buildServerConfig(root: Path, projectRoot: Path, baseWebpackConfig: any, options: any, context: BuilderContext): SingleSpaWepackServerConfig {

    const singleSpaWebpackConfigPath = options.singleSpaWebpackConfigPath;

    if (!singleSpaWebpackConfigPath) {
      return new SingleSpaWepackServerConfig(baseWebpackConfig);
    }

    // @ts-ignore
    const contentBase = projectRoot.serveDirectory || '../';
    const lastPos = root.lastIndexOf('/');
    const publicPath = root.slice(lastPos) + '/' + options.outputPath;   

    const customWebpackConfig = singleSpaWebpackConfigPath ? require(`${getSystemPath(root)}/${singleSpaWebpackConfigPath}`) : {};
    const customWebpackDevServerConfig = customWebpackConfig.devServer;

    const config = webpackMerge.smart(baseWebpackConfig, {
      // @ts-ignore
      contentBase: contentBase,
      historyApiFallback: true,
      publicPath: publicPath,
    }, customWebpackDevServerConfig);

    return new SingleSpaWepackServerConfig(config, publicPath, contentBase)
  }
}