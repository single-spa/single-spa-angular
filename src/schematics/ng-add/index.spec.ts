import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import { join } from 'path';

import { Schema as NgAddOptions } from './schema';

const collectionPath = join(__dirname, '../../../schematics.json');

const workspaceOptions = {
  name: 'ss-workspace',
  newProjectRoot: 'projects',
  version: '6.0.0'
};

const defaultApplicationOptions = {
  name: 'ss-angular-cli-app',
  prefix: 'test',
  inlineStyle: false,
  inlineTemplate: false,
  routing: true,
  skipTests: true,
  style: 'scss'
};

describe('ng-add', () => {
  let defaultAppTree: UnitTestTree;
  const testRunner = new SchematicTestRunner('single-spa-angular', collectionPath);

  beforeAll(() => {
    // Generate a basic Angular CLI application
    const workspaceTree = testRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
    defaultAppTree = testRunner.runExternalSchematic('@schematics/angular', 'application', defaultApplicationOptions, workspaceTree);
  });

  test('should run ng-add', () => {
    const tree = testRunner.runSchematic('ng-add', {}, defaultAppTree);
    expect(tree.files).toBeDefined();
  });

  test('should add single-spa dependency', () => {
    const tree = testRunner.runSchematic<NgAddOptions>('ng-add', {}, defaultAppTree);
    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'))
    expect(packageJSON.dependencies['single-spa-angular']).toBeDefined();
  });

  test('should add main-single-spa.ts', () => {
    const tree = testRunner.runSchematic<NgAddOptions>('ng-add', {}, defaultAppTree);
    expect(tree.files.indexOf('/projects/ss-angular-cli-app/src/main.single-spa.ts')).toBeGreaterThan(-1);
  });

  test('should use correct prefix for root', () => {
    const tree = testRunner.runSchematic<NgAddOptions>('ng-add', {}, defaultAppTree);
    const mainModuleContent = getFileContent(tree, '/projects/ss-angular-cli-app/src/main.single-spa.ts')
    expect(mainModuleContent.indexOf('<test-root />')).toBeGreaterThan(-1);
  });

  test('should not add router dependencies', () => {
    const tree = testRunner.runSchematic<NgAddOptions>('ng-add', { routing: false }, defaultAppTree);
    const mainModuleContent = getFileContent(tree, '/projects/ss-angular-cli-app/src/main.single-spa.ts')
    expect(mainModuleContent.indexOf('@angular/router')).toBe(-1);
  });

  test('should add router dependencies', () => {
    const tree = testRunner.runSchematic<NgAddOptions>('ng-add', { routing: true }, defaultAppTree);
    const mainModuleContent = getFileContent(tree, '/projects/ss-angular-cli-app/src/main.single-spa.ts')
    expect(mainModuleContent.indexOf('@angular/router')).toBeGreaterThan(-1);
  });

  test('should modify angular.json', () => {
    const tree = testRunner.runSchematic<NgAddOptions>('ng-add', { routing: true, project: 'ss-angular-cli-app' }, defaultAppTree);
    const angularJSON = JSON.parse(getFileContent(tree, '/angular.json'));
    const ssApp = angularJSON.projects['ss-angular-cli-app'];
    expect(ssApp.architect['single-spa']).toBeDefined();
    expect(ssApp.architect['single-spa'].builder).toBe('single-spa-angular:build');    
    expect(ssApp.architect['single-spa'].options.main).toBe('projects/ss-angular-cli-app/src/main.single-spa.ts');
    expect(ssApp.architect['single-spa-serve']).toBeDefined();
    expect(ssApp.architect['single-spa-serve'].builder).toBe('single-spa-angular:dev-server');    
    expect(ssApp.architect['single-spa-serve'].options.browserTarget).toBe('ss-angular-cli-app:single-spa');
    
  });

  test('should add build:single-spa npm script', () => {
    const tree = testRunner.runSchematic<NgAddOptions>('ng-add', { routing: true }, defaultAppTree);
    const packageJSON = JSON.parse(getFileContent(tree, '/package.json'));
    expect(packageJSON.scripts['build:single-spa']).toBeDefined();
    expect(packageJSON.scripts['serve:single-spa']).toBeDefined();
  });
});
