import { DevServerBuilder } from '@angular-devkit/build-angular';
import { BuilderContext } from '@angular-devkit/architect';
import { virtualFs, Path, tags } from '@angular-devkit/core';
import { SingleSpaBuilderSchema } from '../browser/schema';
import { Configuration } from 'webpack';
import { SingleSpaWebpackBuilder } from '../single-spa-webpack-builder';
import * as fs from 'fs';
import * as path from 'path';
import * as webpackMerge from 'webpack-merge';

// @ts-ignore
export class SingleSpaDevServer extends DevServerBuilder {
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
        // Generate Angular CLI's default builder webpack cofiguration
        const config = super.buildWebpackConfig(root, projectRoot, host, options);

        // Delegate the building of the webpack config to the new builder.
        // Builder based on custom builders implmented by @meltedspark
        // https://github.com/meltedspark/angular-builders
        const webpackConfig = SingleSpaWebpackBuilder.buildWebpackConfig(root, options.singleSpaWebpackConfigPath, config, options, this.context);
        this.context.logger.info(tags.oneLine`
        [single-spa-angular]: Angular dev server is serving application as a single module`);
        return webpackConfig;
    }
    _buildServerConfig(root, projectRoot, options, browserOptions) {
        // @ts-ignore
        const devServerConfig = super._buildServerConfig(root, projectRoot, options, browserOptions);
        const contentBase = path.resolve(root, projectRoot.serveDirectory || '../');
        const lastPos = root.lastIndexOf('/') || root.lastIndexOf(path.sep);
        const publicPath = root.slice(lastPos) + '/' + options.outputPath
        this.context.logger.info(tags.oneLine`[single-spa-angular]: webpack output is served from ${publicPath}`);
        this.context.logger.info(tags.oneLine`[single-spa-angular]: content not from webpack is served from ${contentBase}`);

        return webpackMerge.smart(devServerConfig, {
            // @ts-ignore
            contentBase: contentBase,
            historyApiFallback: true,
            publicPath: publicPath,
        })
    }
}

export default SingleSpaDevServer;