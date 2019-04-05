import { BrowserBuilder } from '@angular-devkit/build-angular';
import { Path, virtualFs } from '@angular-devkit/core';
import * as fs from 'fs';
import { Configuration } from 'webpack';
import { SingleSpaBuilderSchema } from './schema';
import { buildWebpackConfig } from '../single-spa-webpack-builder';

export class SingleSpaBrowserBuilder extends BrowserBuilder {
  buildWebpackConfig(root: Path, projectRoot: Path, host: virtualFs.Host<fs.Stats>, options: SingleSpaBuilderSchema): Configuration {    
    // Disable es2015 polyfills
    // tslint:disable-next-line: max-line-length
    // https://github.com/angular/angular-cli/blob/3d8064bb64d72557474a7484f1b85eaf35788916/packages/angular_devkit/build_angular/src/angular-cli-files/models/webpack-configs/common.ts#L56
    options.es5BrowserSupport = false;
    // Generate Angular CLI's default Browser Webpack cofiguration
    const config = super.buildWebpackConfig(root, projectRoot, host, options);    

    // Delegate the building of the webpack config to the new builder.
    // Builder based on custom builders implmented by @meltedspark
    // https://github.com/meltedspark/angular-builders
    return buildWebpackConfig(root, options.singleSpaWebpackConfigPath, config, options, this.context);
  }
}

export default SingleSpaBrowserBuilder;