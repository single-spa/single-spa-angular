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
  SchematicsException
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getWorkspace, getWorkspacePath } from '@schematics/angular/utility/config';

import { Schema as NgAddOptions } from './schema';
import * as versions from '../library-versions';
import { normalize, join } from 'path';
import { addPackageToPackageJson } from '../utils';
import { WorkspaceProject } from '@angular-devkit/core/src/workspace';

export default function (options: NgAddOptions): Rule {
  return chain([
    addDependencies(options),
    createMainEntry(options),
    updateConfiguration(options),
    addNPMScripts(options),
  ]);
}

export function addDependencies(options: NgAddOptions) {
  return (host: Tree, context: SchematicContext) => {
    addPackageToPackageJson(host, 'single-spa-angular', versions.singleSpaAngular);
    context.addTask(new NodePackageInstallTask());
    context.logger.info(`Added 'single-spa' as a dependency`);
  }
}

export function createMainEntry(options: NgAddOptions) {
  return (host: Tree, context: SchematicContext) => {

    const project = getClientProject(host, options);
    const path = join(normalize(project.workspace.root), 'src');

    const templateSource = apply(url('./_files/src'), [
      applyTemplates({
        prefix: project.workspace.prefix,
        routing: options.routing
      }),
      move(path)
    ]);
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    context.logger.info(`Generated 'main.single-spa.ts`);
    return rule(host, context);
  }
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

    // Copy configuration from build architect
    clientProject.architect['single-spa'] = clientProject.architect.build;
    clientProject.architect['single-spa'].builder = 'single-spa-angular:build';
    clientProject.architect['single-spa'].options.main = 'src/main.single-spa.ts';


    host.overwrite(workspacePath, JSON.stringify(workspace, null, 2));

    context.logger.info(`Updated angular.json configuration`);
    return host;
  };
}

export function addNPMScripts(options: NgAddOptions) {
  return (host: Tree, context: SchematicContext) => {
    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);

    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = JSON.parse(buffer.toString());

    pkg.scripts['build:single-spa'] = `ng run ${options.project}:single-spa`;

    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
  };
}

function getClientProject(host: Tree, options: NgAddOptions): { name: string, workspace: WorkspaceProject } {
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
