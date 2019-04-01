import {MergeStrategy} from 'webpack-merge';

export type MergeStrategies = {[field: string]: MergeStrategy};

export interface SingleSpaWebpackBuilderConfig {
    path?: string;
    mergeStrategies?: MergeStrategies;
    replaceDuplicatePlugins?: boolean
}