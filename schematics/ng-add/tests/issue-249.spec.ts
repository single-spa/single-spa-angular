import { JsonParseMode, parseJsonAst, normalize } from '@angular-devkit/core';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import { findPropertyInAstObject } from '@schematics/angular/utility/json-utils';

import { Schema as NgAddOptions } from '../schema';
import { createWorkspace, createTestRunner } from './utils';

const workspaceOptions = {
  name: 'ss-workspace',
  newProjectRoot: 'projects',
  version: '9.0.0',
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
    appTree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', { routing: true }, appTree)
      .toPromise();

    const expectedTsConfigPath = normalize('projects/ss-angular-cli-app/tsconfig.app.json');
    const buffer = appTree.read(expectedTsConfigPath);
    if (!buffer) {
      throw new Error('Failed to read the tsconfig');
    }

    const tsConfigAst = parseJsonAst(buffer.toString(), JsonParseMode.Loose);
    if (tsConfigAst.kind != 'object') {
      throw new Error(`Root content of '${expectedTsConfigPath}' is not an object.`);
    }

    // We verify that we didn't erased the comment
    if (tsConfigAst.comments === undefined) {
      throw new Error(`No comment has been found in the '${expectedTsConfigPath}' file.`);
    }
    expect(tsConfigAst.comments).toHaveLength(2);
    expect(tsConfigAst.comments[0].text).toBe(angular10Comment);

    // We verify the files property
    const files = findPropertyInAstObject(tsConfigAst, 'files');
    if (!files) {
      throw new Error("'files' field of tsconfig should exist.");
    }
    if (files.kind !== 'array') {
      throw new Error("'files' field of tsconfig should be an array.");
    }

    expect(files.value).toStrictEqual(['src/main.single-spa.ts']);
  });
});
