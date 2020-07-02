import * as webpackMerge from 'webpack-merge';
import * as path from 'path';
import * as fs from 'fs';
import { findUp } from '@angular/cli/utilities/find-up';

export default (config: any, options?: any) => {
  const libraryName = getLibraryName(options);

  const singleSpaConfig: any = {
    output: {
      library: libraryName,
      libraryTarget: options?.customWebpackConfig?.libraryTarget ?? 'umd',
      jsonpFunction: 'webpackJsonp' + libraryName,
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
  };

  const mergedConfig: any = webpackMerge.smart(config, singleSpaConfig);

  if (mergedConfig.output.libraryTarget === 'system') {
    // Don't used named exports when exporting in System.register format.
    delete mergedConfig.output.library;
  }

  removePluginByName(mergedConfig.plugins, 'IndexHtmlWebpackPlugin');
  removeMiniCssExtract(mergedConfig);

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
        (use: any) => typeof use === 'string' && use.includes('mini-css-extract-plugin'),
      );
      if (cssMiniExtractIndex >= 0) {
        rule.use[cssMiniExtractIndex] = { loader: 'style-loader' };
      }
    }
  });
}

function getLibraryName(options: any) {
  if (options?.customWebpackConfig?.libraryName) {
    return options.customWebpackConfig.libraryName;
  }

  const projectName = getProjectNameFromAngularJson();
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

function getProjectNameFromAngularJson(): string | null {
  const angularJsonPath = findUp(['angular.json', '.angular.json'], process.cwd());
  if (!angularJsonPath) return null;

  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
  if (!angularJson.projects) return null;

  const projects = Object.keys(angularJson.projects);

  // if there is exactly one project in the workspace, then that must be this one.
  if (projects.length === 1) return projects[0];

  // If we reach here there are multiple (or zero) projects in angular.json
  // we cannot tell which one to use, so we will end up using the default.
  return null;
}
