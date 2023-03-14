import { normalize } from 'path';
import { UnitTestTree } from '@angular-devkit/schematics/testing';

import { Schema as NgAddOptions } from '../schema';
import { createTestRunner, createWorkspace, getFileContent, VERSION } from './utils';

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

describe('ng-add', () => {
  let appTree: UnitTestTree;
  const testRunner = createTestRunner();

  beforeEach(async () => {
    // Generate a basic Angular CLI application
    appTree = await createWorkspace(testRunner, appTree, workspaceOptions, appOptions);
  });

  test('should run ng-add', async () => {
    const tree = await testRunner.runSchematic(
      'ng-add',
      { project: 'ss-angular-cli-app' },
      appTree,
    );

    expect(tree.files).toBeDefined();
  });

  test('should add single-spa and single-spa-angular to dependencies', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app' },
      appTree,
    );

    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'));
    expect(packageJSON.dependencies['single-spa']).toBeDefined();
    expect(packageJSON.dependencies['single-spa-angular']).toBeDefined();
  });

  test('should add style-laoder to devDependencies', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app' },
      appTree,
    );

    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'));
    expect(packageJSON.devDependencies['style-loader']).toBeDefined();
  });

  test('should add @angular-builders/custom-webpack to devDependencies', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app' },
      appTree,
    );

    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'));
    expect(packageJSON.devDependencies['@angular-builders/custom-webpack']).toBeDefined();
  });

  test('should add main-single-spa.ts', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app' },
      appTree,
    );

    expect(
      tree.files.indexOf('/projects/ss-angular-cli-app/src/main.single-spa.ts'),
    ).toBeGreaterThan(-1);
  });

  test('should use correct prefix for root', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app' },
      appTree,
    );

    const mainModuleContent = getFileContent(
      tree,
      '/projects/ss-angular-cli-app/src/main.single-spa.ts',
    );
    expect(mainModuleContent.indexOf('<test-root />')).toBeGreaterThan(-1);
  });

  test('should not add router dependencies', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app', routing: false },
      appTree,
    );

    const mainModuleContent = getFileContent(
      tree,
      '/projects/ss-angular-cli-app/src/main.single-spa.ts',
    );
    expect(mainModuleContent.indexOf('@angular/router')).toBe(-1);
  });

  test('should add router dependencies', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app', routing: true },
      appTree,
    );

    const mainModuleContent = getFileContent(
      tree,
      '/projects/ss-angular-cli-app/src/main.single-spa.ts',
    );
    expect(mainModuleContent.indexOf('@angular/router')).toBeGreaterThan(-1);
  });

  test('should modify angular.json', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { routing: true, project: 'ss-angular-cli-app' },
      appTree,
    );

    const angularJSON = JSON.parse(getFileContent(tree, '/angular.json'));
    const ssApp = angularJSON.projects['ss-angular-cli-app'];

    expect(ssApp.architect.build.builder).toBe('@angular-builders/custom-webpack:browser');
    expect(ssApp.architect.serve.builder).toBe('@angular-builders/custom-webpack:dev-server');

    const main = normalize(ssApp.architect.build.options.main);
    const expectedMain = normalize('projects/ss-angular-cli-app/src/main.single-spa.ts');
    expect(main).toEqual(expectedMain);

    const expectedCustomWebpackConfigPath = normalize(
      'projects/ss-angular-cli-app/extra-webpack.config.js',
    );
    expect(ssApp.architect.build.options.customWebpackConfig).toEqual({
      libraryName: 'ss-angular-cli-app',
      libraryTarget: 'umd',
      path: expectedCustomWebpackConfigPath,
    });
  });

  test('should add build:single-spa:PROJECT_NAME npm script', async () => {
    const tree = await testRunner.runSchematic<NgAddOptions>(
      'ng-add',
      { project: 'ss-angular-cli-app', routing: true },
      appTree,
    );

    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'));
    expect(packageJSON.scripts['build:single-spa:ss-angular-cli-app']).toBeDefined();
    expect(packageJSON.scripts['serve:single-spa:ss-angular-cli-app']).toBeDefined();
  });
});
