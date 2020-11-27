import * as path from 'path';
import * as fs from 'fs';
import { findUp } from '@angular/cli/utilities/find-up';
import { BrowserBuilderOptions } from '@angular-devkit/build-angular';

export interface DefaultExtraOptions {
  removeMiniCssExtract: boolean;
}
const defaultExtraOptions = {
  removeMiniCssExtract: true,
};

interface Options extends Partial<BrowserBuilderOptions> {
  customWebpackConfig?: {
    libraryName?: string;
    libraryTarget?: string;
  };
}

export default (config: any, options?: Options, extraOptions?: DefaultExtraOptions) => {
  const libraryName = getLibraryName(options);
  extraOptions = { ...defaultExtraOptions, ...extraOptions };

  const singleSpaConfig: any = {
    output: {
      library: libraryName,
      libraryTarget: options?.customWebpackConfig?.libraryTarget ?? 'umd',
      jsonpFunction: 'webpackJsonp' + libraryName,
      devtoolNamespace: libraryName,
    },
    externals: ['zone.js'],
    devServer: {
      historyApiFallback: false,
      contentBase: path.resolve(process.cwd(), 'src'),
      headers: {
        'Access-Control-Allow-Headers': '*',
      },
    },
    module: {
      rules: [
        {
          parser: {
            system: false,
          },
        },
      ],
    },
    devtool: resolveDevtool(options),
  };

  const mergedConfig = mergeConfigs(config, singleSpaConfig);

  if (mergedConfig.output.libraryTarget === 'system') {
    // Don't used named exports when exporting in System.register format.
    delete mergedConfig.output.library;
  }

  removePluginByName(mergedConfig.plugins, 'IndexHtmlWebpackPlugin');
  if (extraOptions.removeMiniCssExtract) {
    removeMiniCssExtract(mergedConfig);
  }

  if (Array.isArray(mergedConfig.entry.styles)) {
    // We want the global styles to be part of the "main" entry. The order of strings in this array
    // matters -- only the last item in the array will have its exports become the exports for the entire
    // webpack bundle
    mergedConfig.entry.main = [...mergedConfig.entry.styles, ...mergedConfig.entry.main];
  }

  // Remove bundles

  // Since Angular 8 supports differential loading it also
  // add `polyfills-es5` to Webpack entries. This is a fix for:
  // https://github.com/single-spa/single-spa-angular/issues/148
  if (mergedConfig.entry['polyfills-es5']) {
    delete mergedConfig.entry['polyfills-es5'];
  }

  delete mergedConfig.entry.polyfills;
  delete mergedConfig.entry.styles;
  delete mergedConfig.optimization.runtimeChunk;
  delete mergedConfig.optimization.splitChunks;

  return mergedConfig;
};

function removePluginByName(plugins: any[], name: string) {
  const pluginIndex = plugins.findIndex(plugin => plugin.constructor.name === name);
  if (pluginIndex > -1) {
    plugins.splice(pluginIndex, 1);
  }
}

function removeMiniCssExtract(config: any) {
  removePluginByName(config.plugins, 'MiniCssExtractPlugin');
  config.module.rules.forEach((rule: any) => {
    if (rule.use) {
      const cssMiniExtractIndex = rule.use.findIndex(
        (use: any) =>
          (typeof use === 'string' && use.includes('mini-css-extract-plugin')) ||
          (typeof use === 'object' && use.loader && use.loader.includes('mini-css-extract-plugin')),
      );
      if (cssMiniExtractIndex >= 0) {
        rule.use[cssMiniExtractIndex] = { loader: 'style-loader' };
      }
    }
  });
}

function getLibraryName(options: Options | undefined): string {
  if (options?.customWebpackConfig?.libraryName) {
    return options.customWebpackConfig.libraryName;
  }

  const projectName = getProjectNameFromAngularJson(options);
  if (projectName) return projectName;

  console.warn(
    'Warning: single-spa-angular could not determine a library name to use and has used a default value.',
  );
  console.info('This may cause issues if this app uses code-splitting or lazy loading.');
  if (!options) {
    console.info('You may also need to update extra-webpack.config.json.');
  }
  console.info(
    'See <https://single-spa.js.org/docs/ecosystem-angular/#use-custom-webpack> for information on how to resolve this.',
  );

  return 'angular_single_spa_project';
}

function getProjectNameFromAngularJson(options: Options | undefined): string | null | undefined {
  const angularJsonPath = findUp(
    ['angular.json', '.angular.json', 'workspace.json'],
    process.cwd(),
  );
  if (!angularJsonPath) return null;

  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
  if (!angularJson.projects) return null;

  const projects = Object.keys(angularJson.projects);

  // if there is exactly one project in the workspace, then that must be this one.
  if (projects.length === 1) return projects[0];

  try {
    // If `projects.length > 1` then this means we're inside a monorepo workspace,
    // that might be an Nrwl Nx workspace. The Nx workspace can contain N different Angular applications.
    // In the following code we're trying to find an Nx project by the `main`
    // property which equals `apps/${applicationName}/src/main.single-spa.ts` and `options`
    // are bounded to the currently built application, so their values cannot differ.

    // We search by `architect.build` since any Angular application has an `architect` configuration
    // in `angular.json` and each `architect` has `build` target, thus any application can be built
    // via `ng build application`.
    return projects.find(
      project => angularJson.projects[project].architect.build.options.main === options!.main,
    );
  } catch {
    // If we reach here there are multiple (or zero) projects in angular.json
    // we cannot tell which one to use, so we will end up using the default.
    return null;
  }
}

function resolveDevtool(options: Options | undefined): boolean | string {
  // If `options.sourceMap = true` or `options.sourceMap.scripts = true` then
  // source maps are enabled for all scripts by default.
  const allSourceMapsEnabled = options?.sourceMap === true;
  const scriptsSourceMapsEnabled =
    typeof options?.sourceMap === 'object' && options.sourceMap.scripts === true;

  if (allSourceMapsEnabled || scriptsSourceMapsEnabled) {
    return 'sourcemap';
  } else {
    // If options are not provided then we shouldn't enable source maps since
    // it can worsen the build time and the developer will not even know about it.
    return false;
  }
}

function mergeConfigs(config: object, singleSpaConfig: object): any {
  // eslint-disable-next-line
  const webpackMerge = require('webpack-merge');

  try {
    // If `merge.smart` is available then it means that Webpack 4 is used.
    return webpackMerge.smart(config, singleSpaConfig);
  } catch {
    // `merge.smart` has been dropped in `webpack-merge@5`.
    return webpackMerge.default(config, singleSpaConfig);
  }
}
