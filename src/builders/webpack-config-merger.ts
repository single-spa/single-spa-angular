import {MergeStrategies} from './single-spa-webpack-builder-config';
import * as webpackMerge from 'webpack-merge';
import {Configuration} from 'webpack';
import {differenceWith, keyBy, merge} from 'lodash'

export class WebpackConfigMerger {
    static merge(webpackConfig1: Configuration, webpackConfig2: Configuration, mergeStrategies: MergeStrategies = {}, replacePlugins = false): Configuration {
        const mergedConfig = webpackMerge.smartStrategy(mergeStrategies)(webpackConfig1, webpackConfig2);
        if (webpackConfig1.plugins && webpackConfig2.plugins){
            const config1ExceptConfig2 = differenceWith(webpackConfig1.plugins, webpackConfig2.plugins, (item1: any, item2: any) => {
                item1.constructor.name === item2.constructor.name;
            })
            if (!replacePlugins){
                const config1ByName = keyBy(webpackConfig1.plugins, 'constructor.name');
                webpackConfig2.plugins = webpackConfig2.plugins.map(p => config1ByName[p.constructor.name]? merge(config1ByName[p.constructor.name], p): p);
            }
            mergedConfig.plugins = [...config1ExceptConfig2, ...webpackConfig2.plugins];
        }
        return mergedConfig;
    }
}