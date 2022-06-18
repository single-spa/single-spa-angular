import { virtualFs, workspaces } from '@angular-devkit/core';
import { chain, Rule, Tree, SchematicsException } from '@angular-devkit/schematics';

import { Schema as NgAddOptions } from './schema';

import { addDependencies } from './rules/add-dependencies';
import { createMainEntry } from './rules/create-main-entry';
import { updateConfiguration } from './rules/update-configuration';
import { addNPMScripts } from './rules/add-npm-scripts';
import { showWarningIfRoutingIsEnabled } from './rules/show-warning-if-routing-is-enabled';

export default function (options: NgAddOptions): Rule {
  return async (tree: Tree) => {
    const { workspace, project, host } = await getWorkspace(tree, options.project);

    return chain([
      addDependencies(),
      createMainEntry(project, options),
      updateConfiguration(workspace, project, host, options),
      addNPMScripts(workspace, project, host, options),
      showWarningIfRoutingIsEnabled(options),
    ]);
  };
}

async function getWorkspace(tree: Tree, projectName: string | undefined) {
  const host = createVirtualHost(tree);
  const { workspace } = await workspaces.readWorkspace('/', host);
  // Previously, we used `projectName` or `workspace.extensions.defaultProject`.
  // The defaultProject workspace option has been deprecated.
  // The project to use will be determined from the current working directory.
  if (!projectName) {
    throw new SchematicsException('The project name is not specified.');
  }

  const project = workspace.projects.get(projectName);

  if (!project) {
    throw new SchematicsException(`Invalid project name: ${projectName}`);
  }

  return { workspace, project, host };
}

function createVirtualHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}
