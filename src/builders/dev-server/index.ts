import { DevServerBuilder } from '@angular-devkit/build-angular';
import { BuilderContext } from '@angular-devkit/architect';
import { virtualFs, Path, tags} from '@angular-devkit/core';
import { SingleSpaBuilderSchema } from '../browser/schema';
import { Configuration } from 'webpack';
import * as fs from 'fs';
import { SingleSpaBrowserBuilder } from '../browser';


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
        SINGLE-SPA-ANGULAR: Angular dev server is serving application as a single module`);
        return webpackConfig;
    }    
}

export default SingleSpaDevServer;