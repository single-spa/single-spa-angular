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

export type ConsoleRecord = [string, any[]];
export type ConsoleRecorder = ConsoleRecord[];

export function skipConsoleLogging<T extends (...args: any[]) => any>(
  fn: T,
  consoleRecorder: ConsoleRecorder = [],
): ReturnType<T> {
  const consoleSpies = [
    jest.spyOn(console, 'log').mockImplementation((...args) => {
      consoleRecorder.push(['log', args]);
    }),
    jest.spyOn(console, 'warn').mockImplementation((...args) => {
      consoleRecorder.push(['warn', args]);
    }),
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      consoleRecorder.push(['error', args]);
    }),
    jest.spyOn(console, 'info').mockImplementation((...args) => {
      consoleRecorder.push(['info', args]);
    }),
  ];
  function restoreSpies() {
    consoleSpies.forEach(spy => spy.mockRestore());
  }
  let restoreSpyAsync = false;
  try {
    const returnValue = fn();
    if (returnValue instanceof Promise) {
      restoreSpyAsync = true;
      return returnValue.finally(() => restoreSpies()) as ReturnType<T>;
    }
    return returnValue;
  } finally {
    if (!restoreSpyAsync) {
      restoreSpies();
    }
  }
}
