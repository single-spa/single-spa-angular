import { UnitTestTree } from '@angular-devkit/schematics/testing';

import { createTestRunner, VERSION } from './utils';

const workspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: VERSION,
};

describe('ng-add', () => {
  let workspaceTree: UnitTestTree;
  const testRunner = createTestRunner();

  async function generateApplication(name: string) {
    await testRunner.runExternalSchematic(
      '@schematics/angular',
      'application',
      {
        name,
        routing: true,
        skipTests: true,
        style: 'scss',
      },
      workspaceTree,
    );
  }

  beforeEach(async () => {
    // Generate workspace w/o application.
    workspaceTree = await testRunner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions,
    );
  });

  test('should create 2 apps in an empty workspace and generate appropriate scripts', async () => {
    // Arrange & act
    await generateApplication('first-cool-app');
    await generateApplication('second-cool-app');

    await testRunner.runSchematic('ng-add', { project: 'first-cool-app' }, workspaceTree);

    const tree = await testRunner.runSchematic(
      'ng-add',
      { project: 'second-cool-app', port: 4201 },
      workspaceTree,
    );

    const { scripts } = JSON.parse(tree.get('/package.json')!.content.toString());

    // Assert `package.json` scripts
    expect(scripts['build:single-spa:first-cool-app']).toBe(
      'ng build first-cool-app --configuration production',
    );
    expect(scripts['serve:single-spa:first-cool-app']).toBe(
      'ng s --project first-cool-app --disable-host-check --port 4200 --live-reload false',
    );

    expect(scripts['build:single-spa:second-cool-app']).toBe(
      'ng build second-cool-app --configuration production',
    );
    expect(scripts['serve:single-spa:second-cool-app']).toBe(
      'ng s --project second-cool-app --disable-host-check --port 4201 --live-reload false',
    );

    // Assert `angular.json` `deployUrl` option
    const config = JSON.parse(tree.get('/angular.json')!.content.toString());

    expect(config.projects['first-cool-app'].architect.build.options.deployUrl).toBe(
      'http://localhost:4200/',
    );

    expect(config.projects['second-cool-app'].architect.build.options.deployUrl).toBe(
      'http://localhost:4201/',
    );
  });
});
