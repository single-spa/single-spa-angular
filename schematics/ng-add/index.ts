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

import { getWorkspace, getWorkspacePath } from '@schematics/angular/utility/config';
import { addPackageJsonDependency, NodeDependency } from '@schematics/angular/utility/dependencies';
import {
  WorkspaceProject,
  Builders,
  BrowserBuilderOptions,
} from '@schematics/angular/utility/workspace-models';

import { normalize, join } from 'path';

import { addScripts } from './add-scripts';
import { Schema as NgAddOptions } from './schema';
import {
  getSingleSpaDependency,
  getSingleSpaAngularDependency,
  getAngularBuildersCustomWebpackDependency,
} from './dependencies';

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
  ]);
}

export function addDependencies(): Rule {
  const dependencies: NodeDependency[] = [
    getSingleSpaDependency(),
    getSingleSpaAngularDependency(),
    getAngularBuildersCustomWebpackDependency(),
  ];

  return (tree: Tree, context: SchematicContext) => {
    for (const dependency of dependencies) {
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
        atLeastAngular8: atLeastAngular8(),
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

    if (atLeastAngular8()) {
      updateProjectNewAngular(context, clientProject, project.name);
      updateTSConfig(host, clientProject);
    } else {
      updateProjectOldAngular(context, clientProject, project);
    }

    host.overwrite(workspacePath, JSON.stringify(workspace, null, 2));

    context.logger.info(`Updated angular.json configuration`);
    // @ts-ignore
    context.logger.info(clientProject.architect.build.builder);
    return host;
  };
}

function updateProjectOldAngular(
  context: SchematicContext,
  clientProject: WorkspaceProject,
  project: any,
) {
  context.logger.info('Using single-spa-angular builder for Angular versions before 8');

  // Copy configuration from build architect
  clientProject!.architect!['single-spa'] = clientProject.architect!.build;
  clientProject!.architect!['single-spa'].builder = 'single-spa-angular:build';
  clientProject!.architect![
    'single-spa'
  ].options.main = `${project.workspace.sourceRoot}/main.single-spa.ts`;

  // Copy configuration from the serve architect
  clientProject.architect!['single-spa-serve'] = clientProject.architect!.serve;
  clientProject.architect!['single-spa-serve'].builder = 'single-spa-angular:dev-server';
  clientProject.architect!['single-spa-serve'].options.browserTarget = `${project.name}:single-spa`;
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
  buildTarget.options.main = join(clientProject.root, 'src/main.single-spa.ts');
  (buildTarget.options as CustomWebpackBuilderOptions).customWebpackConfig = {
    path: join(clientProject.root, 'extra-webpack.config.js'),
    libraryName: projectName,
    libraryTarget: 'umd',
  };

  updateConfigurationsAndDisableOutputHashing(clientProject);

  const devServerBuilder = '@angular-builders/custom-webpack:dev-server' as Builders.DevServer;
  clientProject.architect!.serve!.builder = devServerBuilder;
}

function updateTSConfig(host: Tree, clientProject: WorkspaceProject): void {
  const tsConfigFileName = clientProject.architect!.build!.options.tsConfig;
  const tsConfig = host.read(tsConfigFileName)!.toString('utf-8');
  const json = JSON.parse(tsConfig);
  json.files = ['src/main.single-spa.ts'];
  // The "files" property will only contain path to `main.single-spa.ts` file,
  // because we remove `polyfills` from Webpack `entry` property.
  host.overwrite(tsConfigFileName, JSON.stringify(json, null, 2));
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

function atLeastAngular8(): boolean {
  const { VERSION } = require('@angular/core');
  return Number(VERSION.major) >= 8;
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
