import { join } from 'path';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const collectionPath = join(__dirname, '../../schematics.json');

export const VERSION: string = require('@angular/core/package.json').version;

export async function createWorkspace<WorkspaceOptions extends object, AppOptions extends object>(
  testRunner: SchematicTestRunner,
  appTree: UnitTestTree,
  workspaceOptions: WorkspaceOptions,
  appOptions: AppOptions,
) {
  appTree = await testRunner.runExternalSchematic(
    '@schematics/angular',
    'workspace',
    workspaceOptions,
  );

  appTree = await testRunner.runExternalSchematic(
    '@schematics/angular',
    'application',
    appOptions,
    appTree,
  );

  return appTree;
}

export function createTestRunner(): SchematicTestRunner {
  return new SchematicTestRunner('single-spa-angular', collectionPath);
}

export function getFileContent(tree: Tree, path: string): string {
  const fileEntry = tree.get(path);

  if (!fileEntry) {
    throw new Error(`The file (${path}) does not exist.`);
  }

  return fileEntry.content.toString();
}
