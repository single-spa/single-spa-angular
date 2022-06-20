import { workspaces } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';

import { getBuildTarget } from './utils';
import { Schema as NgAddOptions } from '../schema';

export function addNPMScripts(
  workspace: workspaces.WorkspaceDefinition,
  project: workspaces.ProjectDefinition,
  host: workspaces.WorkspaceHost,
  options: NgAddOptions,
): Rule {
  return (tree: Tree) => {
    const pkgPath = '/package.json';
    const buffer = tree.read(pkgPath);

    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    updateDeployUrl(workspace, project, host, options.port!);
    addScripts(tree, pkgPath, JSON.parse(buffer.toString()), options);
  };
}

/**
 * The user can have multiple applications inside the same workspace.
 * E.g. consider following commands:
 *
 * - `yarn ng new --createApplication false workspace`
 * - `yarn ng generate application first-cool-app`
 * - `yarn ng generate application second-cool-app`
 * - `yarn ng add single-spa-angular --project first-cool-app`
 * - `yarn ng add single-spa-angular --project second-cool-app`
 *
 * In that case our schematics should respect passed `--project` argument.
 * Basically it will create different scripts for different applications, thus the
 * user will be able to run them in parallel. Created scripts will be:
 *
 * - build:single-spa:first-cool-app
 * - serve:single-spa:first-cool-app
 *
 * - build:single-spa:second-cool-app
 * - serve:single-spa:second-cool-app
 */
function addScripts(tree: Tree, pkgPath: string, pkg: any, options: NgAddOptions): void {
  addScriptsForTheSpecificProject(pkg, options.project, options.port!);
  tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
}

function addScriptsForTheSpecificProject(pkg: any, project: string, port: number): void {
  pkg.scripts[`build:single-spa:${project}`] = `ng build ${project} --configuration production`;
  pkg.scripts[
    `serve:single-spa:${project}`
  ] = `ng s --project ${project} --disable-host-check --port ${port} --live-reload false`;
}

/**
 * @description `--deploy-url` option is deprecated, see: https://angular.io/cli/serve#options
 * This step updates the `deployUrl` which might be defined in `[project].architect.build.options.deployUrl`.
 */
async function updateDeployUrl(
  workspace: workspaces.WorkspaceDefinition,
  project: workspaces.ProjectDefinition,
  host: workspaces.WorkspaceHost,
  port: number,
): Promise<void> {
  const buildTarget = getBuildTarget(project);
  buildTarget.options!.deployUrl = `http://localhost:${port}/`;
  await workspaces.writeWorkspace(workspace, host);
}
