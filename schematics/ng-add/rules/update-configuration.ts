// The JSON5 format supports comments and all Angular projects,
// starting from version 10, contain comments in `tsconfig` files.
import { parse } from 'json5';
import { join, normalize, workspaces } from '@angular-devkit/core';
import { BrowserBuilderOptions } from '@angular-devkit/build-angular';
import { Tree, SchematicContext, SchematicsException, Rule } from '@angular-devkit/schematics';

import { Schema as NgAddOptions } from '../schema';

interface CustomWebpackBuilderOptions extends BrowserBuilderOptions {
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
    const buildTarget = project.targets.get('build');

    if (!buildTarget) {
      throw new SchematicsException(`Project target "build" not found.`);
    }

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
  const root = normalize(project.root);
  buildTarget.builder = '@angular-builders/custom-webpack:browser';
  buildTarget.options!.main = join(root, normalize('src/main.single-spa.ts'));
  ((buildTarget.options as unknown) as CustomWebpackBuilderOptions).customWebpackConfig = {
    path: join(root, 'extra-webpack.config.js'),
    libraryName: options.project,
    libraryTarget: 'umd',
  };

  updateConfigurationsAndDisableOutputHashing(buildTarget);

  const serveTarget = project.targets.get('serve');

  if (!serveTarget) {
    return;
  }

  serveTarget.builder = '@angular-builders/custom-webpack:dev-server';
}

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
