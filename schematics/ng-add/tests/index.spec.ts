import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import { join, normalize } from 'path';

import { Schema as NgAddOptions } from '../schema';
import { JsonParseMode, parseJsonAst } from '@angular-devkit/core';
import { findPropertyInAstObject } from '@schematics/angular/utility/json-utils';
import { JsonAstObject } from '@angular-devkit/core/src/json/interface';

const collectionPath = join(__dirname, '../../schematics.json');

const workspaceOptions = {
  name: 'ss-workspace',
  newProjectRoot: 'projects',
  version: '9.0.0',
};

const defaultApplicationOptions = {
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

describe('ng-add', () => {
  let defaultAppTree: UnitTestTree;
  const testRunner = new SchematicTestRunner('single-spa-angular', collectionPath);

  beforeAll(async () => {
    // Generate a basic Angular CLI application
    const workspaceTree = await testRunner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
    defaultAppTree = await testRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        defaultApplicationOptions,
        workspaceTree,
      )
      .toPromise();

    appendCommentToTsConfig(defaultAppTree);
  });

  test('should run ng-add', async () => {
    const tree = await testRunner.runSchematicAsync('ng-add', {}, defaultAppTree).toPromise();
    expect(tree.files).toBeDefined();
  });

  test('should add single-spa and single-spa-angular to dependencies', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', {}, defaultAppTree)
      .toPromise();
    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'));
    expect(packageJSON.dependencies['single-spa']).toBeDefined();
    expect(packageJSON.dependencies['single-spa-angular']).toBeDefined();
  });

  test('should add @angular-builders/custom-webpack to devDependencies', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', {}, defaultAppTree)
      .toPromise();
    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'));
    expect(packageJSON.devDependencies['@angular-builders/custom-webpack']).toBeDefined();
  });

  test('should add main-single-spa.ts', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', {}, defaultAppTree)
      .toPromise();
    expect(
      tree.files.indexOf('/projects/ss-angular-cli-app/src/main.single-spa.ts'),
    ).toBeGreaterThan(-1);
  });

  test('should use correct prefix for root', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', {}, defaultAppTree)
      .toPromise();
    const mainModuleContent = getFileContent(
      tree,
      '/projects/ss-angular-cli-app/src/main.single-spa.ts',
    );
    expect(mainModuleContent.indexOf('<test-root />')).toBeGreaterThan(-1);
  });

  test('should not add router dependencies', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', { routing: false }, defaultAppTree)
      .toPromise();
    const mainModuleContent = getFileContent(
      tree,
      '/projects/ss-angular-cli-app/src/main.single-spa.ts',
    );
    expect(mainModuleContent.indexOf('@angular/router')).toBe(-1);
  });

  test('should add router dependencies', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', { routing: true }, defaultAppTree)
      .toPromise();
    const mainModuleContent = getFileContent(
      tree,
      '/projects/ss-angular-cli-app/src/main.single-spa.ts',
    );
    expect(mainModuleContent.indexOf('@angular/router')).toBeGreaterThan(-1);
  });

  test('should modify angular.json', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>(
        'ng-add',
        { routing: true, project: 'ss-angular-cli-app' },
        defaultAppTree,
      )
      .toPromise();
    const angularJSON = JSON.parse(getFileContent(tree, '/angular.json'));
    const ssApp = angularJSON.projects['ss-angular-cli-app'];

    expect(ssApp.architect.build.builder).toBe('@angular-builders/custom-webpack:browser');
    expect(ssApp.architect.serve.builder).toBe('@angular-builders/custom-webpack:dev-server');

    const main = normalize(ssApp.architect.build.options.main);
    const expectedMain = normalize('projects/ss-angular-cli-app/src/main.single-spa.ts');
    expect(main).toEqual(expectedMain);

    const customWebpackConfigPath = normalize(
      ssApp.architect.build.options.customWebpackConfig.path,
    );
    const expectedCustomWebpackConfigPath = normalize(
      'projects/ss-angular-cli-app/extra-webpack.config.js',
    );
    expect(ssApp.architect.build.options.customWebpackConfig).toEqual({
      libraryName: 'ss-angular-cli-app',
      libraryTarget: 'umd',
      path: expectedCustomWebpackConfigPath,
    });
  });

  test('should add build:single-spa npm script', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', { routing: true }, defaultAppTree)
      .toPromise();
    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'));
    expect(packageJSON.scripts['build:single-spa']).toBeDefined();
    expect(packageJSON.scripts['serve:single-spa']).toBeDefined();
  });

  // https://github.com/single-spa/single-spa-angular/issues/128
  test('should update `tsconfig.app.json` and add `main.single-spa.ts` to `files`', async () => {
    const tree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', { routing: true }, defaultAppTree)
      .toPromise();

    const expectedTsConfigPath = normalize('projects/ss-angular-cli-app/tsconfig.app.json');
    const buffer = defaultAppTree.read(expectedTsConfigPath);
    if (!buffer) {
      throw new Error('Failed to read the tsconfig');
    }

    const tsCfgAst = parseJsonAst(buffer.toString(), JsonParseMode.Loose);
    if (tsCfgAst.kind != 'object') {
      throw new Error(`Root content of '${expectedTsConfigPath}' is not an object.`);
    }

    // We verify that we didn't erased the comment
    if (tsCfgAst.comments === undefined) {
      throw new Error(`No comment has been found in the '${expectedTsConfigPath}' file.`);
    }
    expect(tsCfgAst.comments).toHaveLength(1);
    expect(tsCfgAst.comments[0].text).toBe(angular10Comment);

    // We verify the files property
    const files = findPropertyInAstObject(tsCfgAst, 'files');
    if (!files) {
      throw new Error("'files' field of tsconfig should exist.");
    }
    if (files.kind !== 'array') {
      throw new Error("'files' field of tsconfig should be an array.");
    }

    expect(files.value).toStrictEqual(['src/main.single-spa.ts']);
  });
});
