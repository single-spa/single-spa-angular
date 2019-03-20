import { BrowserBuilder } from '@angular-devkit/build-angular';
import { Path, virtualFs } from '@angular-devkit/core';
import { BuilderContext } from '@angular-devkit/architect';
import * as fs from 'fs';
import { Configuration } from 'webpack';
import * as webpackMerge from 'webpack-merge';

import { SingleSpaBuilderSchema } from './schema';

export class SingleSpaBrowserBuilder extends BrowserBuilder {
  constructor(context: BuilderContext) {
    super(context);
  }

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<fs.Stats>,
    options: SingleSpaBuilderSchema
  ): Configuration {
    // Disable es2015 polyfills
    // tslint:disable-next-line: max-line-length
    // https://github.com/angular/angular-cli/blob/3d8064bb64d72557474a7484f1b85eaf35788916/packages/angular_devkit/build_angular/src/angular-cli-files/models/webpack-configs/common.ts#L56
    options.es5BrowserSupport = false;

    // Generate Angular CLI's default Browser Webpack cofiguration
    const config = super.buildWebpackConfig(root, projectRoot, host, options);

    // Remove bundles
    delete config.entry.polyfills;
    delete config.entry.styles;
    delete config.optimization.runtimeChunk;
    delete config.optimization.splitChunks;

    // Remove Angular's IndexHtmlWebpackPlugin from build
    const indexHtmlWebpackPluginIndex = config.plugins.findIndex(
      plugin => (plugin as any).constructor.name === 'IndexHtmlWebpackPlugin'
    );

    if (indexHtmlWebpackPluginIndex > -1) {
      config.plugins.splice(indexHtmlWebpackPluginIndex, 1);
    }

    return webpackMerge.smart(config, {
      output: {
        library: options.libraryName,
        libraryTarget: options.libraryTarget,
      },
      externals: {
        'zone.js': 'Zone',
      },
    });
  }
}

export default SingleSpaBrowserBuilder;
