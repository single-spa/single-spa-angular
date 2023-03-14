import { UnitTestTree } from '@angular-devkit/schematics/testing';

import { createTestRunner, VERSION } from './utils';

const workspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: VERSION,
};

describe('https://github.com/single-spa/single-spa-angular/issues/168', () => {
  let workspaceTree: UnitTestTree;
  const testRunner = createTestRunner();

  function generateApplication(name: string) {
    return testRunner.runExternalSchematic(
      '@schematics/angular',
      'application',
      {
        name,
      },
      workspaceTree,
    );
  }

  beforeEach(async () => {
    workspaceTree = await testRunner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions,
    );
  });

  test('should update all configurations and disable output hashing', async () => {
    // Arrange
    const appTree = await generateApplication('first-cool-app');
    let buildTarget = JSON.parse(`${appTree.get('/angular.json')!.content}`);
    let configurations = buildTarget.projects['first-cool-app'].architect.build.configurations;
    // `development` and `production` are always present by default since Angular 12.
    const { development, production } = configurations;
    // Let's just add more configurations for testing purposes.
    configurations['us-dev'] = { ...development };
    configurations['eu-west-1'] = { ...production };

    // Act
    appTree.overwrite('/angular.json', JSON.stringify(buildTarget));

    await testRunner.runSchematic('ng-add', { project: 'first-cool-app' }, appTree);

    buildTarget = JSON.parse(`${appTree.get('/angular.json')!.content}`);
    configurations = buildTarget.projects['first-cool-app'].architect.build.configurations;

    // Arrange
    expect(Object.keys(configurations).length).toBe(4);

    for (let i = 0; i < configurations.length; i++) {
      expect(configurations[i].outputHashing).toBe('none');
    }
  });

  test('should update all configurations in the provided "--project"', async () => {
    // Arrange
    await generateApplication('first-cool-app');
    const appTree = await generateApplication('second-cool-app');
    let buildTarget = JSON.parse(`${appTree.get('/angular.json')!.content}`);
    let configurations = buildTarget.projects['second-cool-app'].architect.build.configurations;
    // `development` and `production` are always present by default since Angular 12.
    const { development, production } = configurations;
    // Let's just add more configurations for testing purposes.
    configurations['us-dev'] = { ...development };
    configurations['eu-west-1'] = { ...production };

    // Act
    appTree.overwrite('/angular.json', JSON.stringify(buildTarget));

    await testRunner.runSchematic('ng-add', { project: 'second-cool-app' }, appTree);

    buildTarget = JSON.parse(`${appTree.get('/angular.json')!.content}`);
    configurations = buildTarget.projects['second-cool-app'].architect.build.configurations;

    // Arrange
    expect(Object.keys(configurations).length).toBe(4);

    for (let i = 0; i < configurations.length; i++) {
      expect(configurations[i].outputHashing).toBe('none');
    }
  });
});
