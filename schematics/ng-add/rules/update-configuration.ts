// The JSON5 format supports comments and all Angular projects,
// starting from version 10, contain comments in `tsconfig` files.
import { parse } from 'json5';
import { join, normalize, workspaces } from '@angular-devkit/core';
import { Tree, SchematicContext, Rule } from '@angular-devkit/schematics';

import { getBuildTarget } from './utils';
import { Schema as NgAddOptions } from '../schema';

interface CustomWebpackBuilderOptions {
  customWebpackConfig: {
    path: string;
    libraryName?: string;
    libraryTarget?: string;
  };
}

export function updateConfiguration(
  workspace: workspaces.WorkspaceDefinition,
  project: workspaces.ProjectDefinition,
  host: workspaces.WorkspaceHost,
  options: NgAddOptions,
): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const buildTarget = getBuildTarget(project);

    updateAngularConfiguration(context, project, buildTarget, options);
    updateTSConfig(tree, buildTarget);

    await workspaces.writeWorkspace(workspace, host);

    context.logger.info(`Updated angular.json configuration`);
    context.logger.info(buildTarget.builder);
  };
}

function updateAngularConfiguration(
  context: SchematicContext,
  project: workspaces.ProjectDefinition,
  buildTarget: workspaces.TargetDefinition,
  options: NgAddOptions,
): void {
  context.logger.info('Using @angular-builders/custom-webpack builder.');

  updateBuildTarget(buildTarget, project, options);
  updateConfigurationsAndDisableOutputHashing(buildTarget);

  const serveTarget = project.targets.get('serve');

  if (!serveTarget) {
    return;
  }

  serveTarget.builder = '@angular-builders/custom-webpack:dev-server';
}

/**
 * @description This steps updates configurations which are defined
 * in `[project].architect.build.configurations` and sets `outputHashing` to `none`
 * for each configuration.
 */
function updateConfigurationsAndDisableOutputHashing(
  buildTarget: workspaces.TargetDefinition,
): void {
  // If the user doesn't have any `configurations` then just skip this step.
  if (typeof buildTarget.configurations !== 'object') {
    return;
  }

  for (const configuration of Object.values(buildTarget.configurations)) {
    configuration!.outputHashing = 'none';
  }
}

/**
 * @description This step resolves the `tsconfig.app.json` path which is defined
 * in `[project].architect.build.options.tsConfig`, reads the TS config and updates
 * the `files` property to point to `main.single-spa.ts` file.
 *
 * This is how `tsconfig.app.json` looks by default in any Angular project:
 * ```json
 * To learn more about this file see: https://angular.io/config/tsconfig.
 * {
 *   "extends": "./tsconfig.json",
 *   "compilerOptions": { ... },
 *   "files": [
 *     "src/main.ts",
 *     "src/polyfills.ts"
 *   ]
 * }
 * ```
 *
 * This is how it will look like after update:
 * ```json
 * {
 *   "extends": "./tsconfig.json",
 *   "compilerOptions": { ... },
 *   "files": ["src/main.single-spa.ts"]
 * }
 * ```
 */
function updateTSConfig(tree: Tree, buildTarget: workspaces.TargetDefinition): void {
  const tsConfigPath = <string>buildTarget.options!.tsConfig;
  const buffer: Buffer | null = tree.read(tsConfigPath);

  if (buffer === null) {
    return;
  }

  const tsConfig = parse(buffer.toString());

  if (!Array.isArray(tsConfig.files)) {
    return;
  }

  // The "files" property will only contain path to `main.single-spa.ts` file,
  // because we remove `polyfills` from Webpack `entry` property.
  tsConfig.files = [normalize('src/main.single-spa.ts')];
  tree.overwrite(tsConfigPath, JSON.stringify(tsConfig, null, 2));
}

/**
 * @description This step updates options for the build target defined in
 * `[project].architect.build.options`. This is how it will look like after update:
 * ```json
 * "builder": "@angular-builders/custom-webpack:browser",
 * "options": {
 *   "customWebpackConfig": {
 *     "path": "extra-webpack.config.js"
 *   }
 *   "main": "src/main.single-spa.ts"
 * }
 * ```
 */
function updateBuildTarget(
  buildTarget: workspaces.TargetDefinition,
  project: workspaces.ProjectDefinition,
  options: NgAddOptions,
): void {
  const root = normalize(project.root);

  buildTarget.builder = '@angular-builders/custom-webpack:browser';
  buildTarget.options!.main = join(root, normalize('src/main.single-spa.ts'));
  (buildTarget.options as unknown as CustomWebpackBuilderOptions).customWebpackConfig = {
    path: join(root, 'extra-webpack.config.js'),
    libraryName: options.project,
    libraryTarget: 'umd',
  };
}
