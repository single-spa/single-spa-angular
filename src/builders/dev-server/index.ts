import { DevServerBuilder } from '@angular-devkit/build-angular';
import { BuilderContext } from '@angular-devkit/architect';
import { virtualFs, Path, tags } from '@angular-devkit/core';
import { SingleSpaBuilderSchema } from '../browser/schema';
import { Configuration } from 'webpack';
import * as fs from 'fs';
import * as path from 'path';
import { SingleSpaBrowserBuilder } from '../browser';
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
        const browserBuilder = new SingleSpaBrowserBuilder(this.context);
        const webpackConfig = browserBuilder.buildWebpackConfig(root, projectRoot, host, options);
        this.context.logger.info(tags.oneLine `
        [single-spa-angular]: Angular dev server is serving application as a single module`);
        return webpackConfig;
    }    
    _buildServerConfig(root, projectRoot, options, browserOptions) {
        // @ts-ignore
        const devServerConfig = super._buildServerConfig(root, projectRoot, options, browserOptions);
        const contentBase = path.resolve(root, projectRoot.serveDirectory || '../');
        const lastPos = root.lastIndexOf('/') || root.lastIndexOf(path.sep);
        const publicPath = root.slice(lastPos) + '/' + options.outputPath        
        this.context.logger.info(tags.oneLine `[single-spa-angular]: webpack output is served from ${publicPath}`);
        this.context.logger.info(tags.oneLine `[single-spa-angular]: content not from webpack is served from ${contentBase}`);

        return webpackMerge.smart(devServerConfig, {
            // @ts-ignore
            contentBase: contentBase,
            historyApiFallback: true,
            publicPath: publicPath,
        })
    }
}

export default SingleSpaDevServer;