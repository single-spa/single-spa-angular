import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';

const collectionPath = join(__dirname, '../../schematics.json');

const workspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '9.0.0',
};

describe('https://github.com/single-spa/single-spa-angular/issues/168', () => {
  let workspaceTree: UnitTestTree;
  const testRunner = new SchematicTestRunner('single-spa-angular', collectionPath);

  function generateApplication(name: string, project?: string) {
    return testRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        {
          name,
          project,
        },
        workspaceTree,
      )
      .toPromise();
  }

  beforeEach(async () => {
    workspaceTree = await testRunner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
  });

  test('should update all configurations and disable output hashing', async () => {
    // Arrange
    const appTree = await generateApplication('first-cool-app');
    let buildTarget = JSON.parse(`${appTree.get('/angular.json')!.content}`);
    let configurations = buildTarget.projects['first-cool-app'].architect.build.configurations;
    // `production` is always present by default
    const production = configurations.production;
    // Let's just add more configurations for testing purposes.
    configurations['us-dev'] = { ...production };
    configurations['eu-west-1'] = { ...production };

    // Act
    appTree.overwrite('/angular.json', JSON.stringify(buildTarget));

    await testRunner.runSchematicAsync('ng-add', undefined, appTree).toPromise();

    buildTarget = JSON.parse(`${appTree.get('/angular.json')!.content}`);
    configurations = buildTarget.projects['first-cool-app'].architect.build.configurations;

    // Arrange
    expect(Object.keys(configurations).length).toBe(3);

    for (const configuration of configurations) {
      expect(configuration.outputHashing).toBe('none');
    }
  });

  test('should update all configurations in the provided "--project"', async () => {
    // Arrange
    await generateApplication('first-cool-app');
    const appTree = await generateApplication('second-cool-app', 'second-cool-app');
    let buildTarget = JSON.parse(`${appTree.get('/angular.json')!.content}`);
    let configurations = buildTarget.projects['second-cool-app'].architect.build.configurations;
    // `production` is always present by default
    const production = configurations.production;
    // Let's just add more configurations for testing purposes.
    configurations['us-dev'] = { ...production };
    configurations['eu-west-1'] = { ...production };

    // Act
    appTree.overwrite('/angular.json', JSON.stringify(buildTarget));

    await testRunner
      .runSchematicAsync('ng-add', { project: 'second-cool-app' }, appTree)
      .toPromise();

    buildTarget = JSON.parse(`${appTree.get('/angular.json')!.content}`);
    configurations = buildTarget.projects['second-cool-app'].architect.build.configurations;

    // Arrange
    expect(Object.keys(configurations).length).toBe(3);

    for (const configuration of configurations) {
      expect(configuration.outputHashing).toBe('none');
    }
  });
});
