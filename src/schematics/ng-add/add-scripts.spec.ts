import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';

const collectionPath = join(__dirname, '../../../schematics.json');

const workspaceOptions = {
  name: 'workspace',
  createApplication: false,
  newProjectRoot: 'projects',
  version: '9.0.0',
};

describe('ng-add', () => {
  let workspaceTree: UnitTestTree;
  const testRunner = new SchematicTestRunner('single-spa-angular', collectionPath);

  async function generateApplication(name: string) {
    await testRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        {
          name,
          project: name,
          routing: true,
          skipTests: true,
          style: 'scss',
        },
        workspaceTree,
      )
      .toPromise();
  }

  beforeAll(async () => {
    // Generate workspace w/o application.
    workspaceTree = await testRunner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
  });

  it('should create 2 apps in an empty workspace and generate appropriate scripts', async () => {
    // Arrange & act
    await generateApplication('first-cool-app');
    await generateApplication('second-cool-app');

    await testRunner
      .runSchematicAsync('ng-add', { project: 'first-cool-app' }, workspaceTree)
      .toPromise();

    const tree = await testRunner
      .runSchematicAsync('ng-add', { project: 'second-cool-app' }, workspaceTree)
      .toPromise();

    const packageJSON = JSON.parse(tree.get('/package.json').content.toString());

    // Assert
    expect(packageJSON.scripts['build:single-spa:first-cool-app']).toBe(
      'ng build first-cool-app --prod --deploy-url http://localhost:4200/',
    );
    expect(packageJSON.scripts['serve:single-spa:first-cool-app']).toBe(
      'ng s --project first-cool-app --disable-host-check --port 4200 --deploy-url http://localhost:4200/ --live-reload false',
    );

    expect(packageJSON.scripts['build:single-spa:second-cool-app']).toBe(
      'ng build second-cool-app --prod --deploy-url http://localhost:4201/',
    );
    expect(packageJSON.scripts['serve:single-spa:second-cool-app']).toBe(
      'ng s --project second-cool-app --disable-host-check --port 4201 --deploy-url http://localhost:4201/ --live-reload false',
    );
  });
});
