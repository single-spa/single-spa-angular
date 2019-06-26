import { DevServerBuilder } from '@angular-devkit/build-angular';
import { virtualFs, Path, tags } from '@angular-devkit/core';
import { SingleSpaBuilderSchema } from '../browser/schema';
import { Configuration } from 'webpack';
import { buildWebpackConfig } from '../single-spa-webpack-builder';
import * as fs from 'fs';
import * as webpackMerge from 'webpack-merge';
import { getSystemPath } from '@angular-devkit/core';
import * as path from 'path';

// @ts-ignore
export class SingleSpaDevServer extends DevServerBuilder {
    buildWebpackConfig(root: Path, projectRoot: Path, host: virtualFs.Host<fs.Stats>, options: SingleSpaBuilderSchema): Configuration {
        // Disable es2015 polyfills
        // tslint:disable-next-line: max-line-length
        // https://github.com/angular/angular-cli/blob/3d8064bb64d72557474a7484f1b85eaf35788916/packages/angular_devkit/build_angular/src/angular-cli-files/models/webpack-configs/common.ts#L56
        options.es5BrowserSupport = false;
        // Generate Angular CLI's default builder webpack cofiguration
        const config = super.buildWebpackConfig(root, projectRoot, host, options);

        // Delegate the building of the webpack config to the new builder.
        // Builder based on custom builders implmented by @meltedspark
        // https://github.com/meltedspark/angular-builders
        const webpackConfig = buildWebpackConfig(root, options.singleSpaWebpackConfigPath, config, options, this.context);
        return webpackConfig;
    }
    _buildServerConfig(root, projectRoot, options, browserOptions) {
        // super._buildServerConfig will call into our overriding buildWebpackConfig,        
        // @ts-ignore
        const defaultServerConfig = super._buildServerConfig(root, projectRoot, options, browserOptions);

        // the angular cli implementation ignores any devServer customisation that we might have put in
        // the external webpack configuration so we need to put it back in.
        const singleSpaWebpackConfigPath = options.singleSpaWebpackConfigPath;

        const customWebpackConfig = singleSpaWebpackConfigPath ? require(`${getSystemPath(root)}/${singleSpaWebpackConfigPath}`) : {};
        const customWebpackDevServerConfig = customWebpackConfig.devServer;

        const finalConfig = webpackMerge.smart(defaultServerConfig, {
            // @ts-ignore
            historyApiFallback: false,
            contentBase: path.resolve(process.cwd(), 'src'),
            headers: {
                'Access-Control-Allow-Headers': '*',
            }
        }, customWebpackDevServerConfig);

        // @ts-ignore
        this.context.logger.info(tags.oneLine`Your single-spa application can be downloaded at http://localhost:${finalConfig.port}/main.js`);

        return finalConfig;
    }
}

export default SingleSpaDevServer;