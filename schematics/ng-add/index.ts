import {
  Rule,
  chain,
  SchematicContext,
  Tree,
  apply,
  url,
  MergeStrategy,
  mergeWith,
  move,
  applyTemplates,
  SchematicsException,
} from '@angular-devkit/schematics';

import { addPackageJsonDependency, NodeDependency } from '@schematics/angular/utility/dependencies';
import {
  WorkspaceProject,
  Builders,
  BrowserBuilderOptions,
} from '@schematics/angular/utility/workspace-models';

import { join, normalize } from '@angular-devkit/core';
// The JSON5 format supports comments and all Angular projects,
// starting from version 10, contain comments in `tsconfig` files.
import { parse } from 'json5';

import { addScripts } from './add-scripts';
import { Schema as NgAddOptions } from './schema';
import {
  getSingleSpaDependency,
  getSingleSpaAngularDependency,
  getAngularBuildersCustomWebpackDependency,
} from './dependencies';
import { getWorkspace, getWorkspacePath } from './workspace';

interface CustomWebpackBuilderOptions extends BrowserBuilderOptions {
  customWebpackConfig: {
    path: string;
    libraryName?: string;
    libraryTarget?: string;
  };
}

export default function (options: NgAddOptions): Rule {
  return chain([
    addDependencies(),
    createMainEntry(options),
    updateConfiguration(options),
    addNPMScripts(options),
    showWarningIfRoutingIsEnabled(options),
  ]);
}

export function addDependencies(): Rule {
  const dependencies: Array<NodeDependency | Promise<NodeDependency>> = [
    getSingleSpaDependency(),
    getSingleSpaAngularDependency(),
    getAngularBuildersCustomWebpackDependency(),
  ];

  return async (tree: Tree, context: SchematicContext) => {
    for await (const dependency of dependencies) {
      addPackageJsonDependency(tree, dependency);
      context.logger.info(`Added '${dependency.name}' as a dependency`);
    }
  };
}

export function createMainEntry(options: NgAddOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const project = getClientProject(host, options);
    const path = normalize(project.workspace.root);

    const templateSource = apply(url('./_files'), [
      applyTemplates({
        prefix: project.workspace.prefix,
        routing: options.routing,
        usingBrowserAnimationsModule: options.usingBrowserAnimationsModule,
      }),
      move(path),
    ]);
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    context.logger.info(`Generated 'main.single-spa.ts`);
    context.logger.info(`Generated 'single-spa-props.ts`);
    context.logger.info(`Generated asset-url.ts`);
    context.logger.info(`Generated extra-webpack.config.js`);
    return rule(host, context);
  };
}

export function updateConfiguration(options: NgAddOptions) {
  return (host: Tree, context: SchematicContext) => {
    const workspace = getWorkspace(host);
    const project = getClientProject(host, options);

    const clientProject = workspace.projects[project.name];
    if (!clientProject.architect) {
      throw new Error('Client project architect not found.');
    }
    const workspacePath = getWorkspacePath(host);

    updateProjectNewAngular(context, clientProject, project.name);
    updateTSConfig(host, clientProject);

    host.overwrite(workspacePath, JSON.stringify(workspace, null, 2));

    context.logger.info(`Updated angular.json configuration`);
    // @ts-ignore
    context.logger.info(clientProject.architect.build.builder);
    return host;
  };
}

function updateProjectNewAngular(
  context: SchematicContext,
  clientProject: WorkspaceProject,
  projectName: string,
): void {
  context.logger.info('Using @angular-devkit/custom-webpack builder.');

  const buildTarget = clientProject.architect!.build!;
  const browserBuilder = '@angular-builders/custom-webpack:browser' as Builders.Browser;

  buildTarget.builder = browserBuilder;
  buildTarget.options.main = join(
    normalize(clientProject.root),
    normalize('src/main.single-spa.ts'),
  );
  (buildTarget.options as CustomWebpackBuilderOptions).customWebpackConfig = {
    path: join(normalize(clientProject.root), 'extra-webpack.config.js'),
    libraryName: projectName,
    libraryTarget: 'umd',
  };

  updateConfigurationsAndDisableOutputHashing(clientProject);

  const devServerBuilder = '@angular-builders/custom-webpack:dev-server' as Builders.DevServer;
  clientProject.architect!.serve!.builder = devServerBuilder;
}

function updateTSConfig(host: Tree, clientProject: WorkspaceProject): void {
  const tsConfigPath = clientProject.architect!.build!.options.tsConfig;
  const buffer: Buffer | null = host.read(tsConfigPath);

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
  host.overwrite(tsConfigPath, JSON.stringify(tsConfig, null, 2));
}

export function addNPMScripts(options: NgAddOptions): Rule {
  return (host: Tree) => {
    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);

    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    addScripts(host, pkgPath, JSON.parse(buffer.toString()), options.project);
  };
}

export function showWarningIfRoutingIsEnabled(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.routing) {
      context.logger.warn(
        'Warning: Since the routing is enabled an additional manual\n' +
          'configuration will be required, see https://single-spa.js.org/docs/ecosystem-angular/#configure-routes',
      );
    }
  };
}

function getClientProject(
  host: Tree,
  options: NgAddOptions,
): { name: string; workspace: WorkspaceProject } {
  const workspace = getWorkspace(host);
  let project = options.project;
  if (!options.project) {
    project = Object.keys(workspace.projects)[0];
  }

  const clientProject = workspace.projects[project!];
  if (!clientProject) {
    throw new SchematicsException(`Client app ${options.project} not found.`);
  }

  return { name: project!, workspace: clientProject };
}

function updateConfigurationsAndDisableOutputHashing(clientProject: WorkspaceProject): void {
  const configurations = clientProject.architect!.build!.configurations;

  // If the user doesn't have any `configurations` then just skip this step.
  if (typeof configurations !== 'object') {
    return;
  }

  for (const configuration of Object.values(configurations)) {
    configuration.outputHashing = 'none';
  }
}
