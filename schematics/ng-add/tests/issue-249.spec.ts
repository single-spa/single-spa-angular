import { normalize } from '@angular-devkit/core';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import * as JSON5 from 'json5';

import { Schema as NgAddOptions } from '../schema';
import { createWorkspace, createTestRunner, getFileContent, VERSION } from './utils';

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

// Simulate what angular 10 is doing adding a comment to the tsconfig file
// https://github.com/single-spa/single-spa-angular/issues/249
function appendCommentToTsConfig(tree: UnitTestTree) {
  let content = getFileContent(tree, '/projects/ss-angular-cli-app/tsconfig.app.json');
  content = angular10Comment + '\n' + content;
  tree.overwrite('/projects/ss-angular-cli-app/tsconfig.app.json', content);
}

describe('https://github.com/single-spa/single-spa-angular/issues/249', () => {
  let appTree: UnitTestTree;
  const testRunner = createTestRunner();

  beforeEach(async () => {
    appTree = await createWorkspace(testRunner, appTree, workspaceOptions, appOptions);
    appendCommentToTsConfig(appTree);
  });

  test('should update `tsconfig.app.json` and add `main.single-spa.ts` to `files`', async () => {
    appTree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app', routing: true },
      appTree,
    );

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
