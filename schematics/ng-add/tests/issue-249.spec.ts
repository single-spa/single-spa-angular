import { normalize } from '@angular-devkit/core';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import * as JSON5 from 'json5';

import { Schema as NgAddOptions } from '../schema';
import {
  createWorkspace,
  createTestRunner,
  getFileContent,
  VERSION,
  skipConsoleLogging,
} from './utils';

const workspaceOptions = {
  name: 'ss-workspace',
  newProjectRoot: 'projects',
  version: VERSION,
};

const appOptions = {
  name: 'ss-angular-cli-app',
  prefix: 'test',
  inlineStyle: false,
  inlineTemplate: false,
  routing: true,
  skipTests: true,
  style: 'scss',
};

const angular10Comment = '/* Unexpected comment from Angular */';

// Simulate what Angular 10 does: prepend a comment AND include a `files` array.
// Newer Angular versions dropped `files` in favour of `include`/`exclude`, but
// Angular 10–15 shipped both. The comment would break JSON.parse; JSON5 handles it.
// https://github.com/single-spa/single-spa-angular/issues/249
function patchTsConfigToSimulateAngular10(tree: UnitTestTree) {
  const tsConfig = JSON5.parse(
    getFileContent(tree, '/projects/ss-angular-cli-app/tsconfig.app.json'),
  );

  // Inject the `files` entry that older Angular versions included.
  tsConfig.files = ['src/main.ts', 'src/polyfills.ts'];

  // Prepend the comment that Angular 10 adds to every tsconfig.
  const patched = angular10Comment + '\n' + JSON.stringify(tsConfig, null, 2);
  tree.overwrite('/projects/ss-angular-cli-app/tsconfig.app.json', patched);
}

describe('https://github.com/single-spa/single-spa-angular/issues/249', () => {
  let appTree: UnitTestTree;
  const testRunner = createTestRunner();

  beforeEach(async () => {
    appTree = await createWorkspace(testRunner, appTree, workspaceOptions, appOptions);
    patchTsConfigToSimulateAngular10(appTree);
  });

  test('should update `tsconfig.app.json` and add `main.single-spa.ts` to `files`', async () => {
    appTree = await skipConsoleLogging(() => {
      return testRunner.runSchematic<NgAddOptions>(
        'ng-add',
        { project: 'ss-angular-cli-app', routing: true },
        appTree,
      );
    });

    const expectedTsConfigPath = normalize('projects/ss-angular-cli-app/tsconfig.app.json');
    const buffer: Buffer | null = appTree.read(expectedTsConfigPath);
    if (buffer === null) {
      throw new Error('Failed to read the tsconfig');
    }

    const tsConfig = JSON5.parse(buffer.toString());

    if (!tsConfig.files) {
      throw new Error("'files' field of tsconfig should exist.");
    }

    if (!Array.isArray(tsConfig.files)) {
      throw new Error("'files' field of tsconfig should be an array.");
    }

    expect(tsConfig.files).toStrictEqual(['src/main.single-spa.ts']);
  });
});
