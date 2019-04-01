import { SingleSpaWebpackBuilderConfig } from './single-spa-webpack-builder-config';
import { Configuration } from 'webpack';
import { getSystemPath, Path } from '@angular-devkit/core'
import { WebpackConfigMerger } from './webpack-config-merger';
import { BuilderContext } from '@angular-devkit/architect';
import * as webpackMerge from 'webpack-merge';

export const defaultWebpackConfigPath = "webpack.config.js";

export class SingleSpaWebpackBuilder {
    static buildWebpackConfig(root: Path,
        config: SingleSpaWebpackBuilderConfig,
        baseWebpackConfig: Configuration,
        options: any,
        context: BuilderContext): Configuration {
        if (!config) {
            return baseWebpackConfig
        }        

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

        let mergedConfig: any = {};

        mergedConfig = webpackMerge.smart(baseWebpackConfig, singleSpaConfig)

        const webpackConfigPath = config.path || defaultWebpackConfigPath;
        const customWebpackConfig = require(`${getSystemPath(root)}/${webpackConfigPath}`);
        
        if (typeof customWebpackConfig === 'function') {
            mergedConfig = customWebpackConfig(mergedConfig, options);
        } else {
            mergedConfig = WebpackConfigMerger.merge(mergedConfig, customWebpackConfig, config.mergeStrategies, config.replaceDuplicatePlugins);
        }

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
}