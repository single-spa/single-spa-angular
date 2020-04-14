import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';

const collectionPath = join(__dirname, '../../schematics.json');

const workspaceOptions = {
  name: 'workspace',
  createApplication: false,
  newProjectRoot: 'projects',
  version: '9.0.0',
};

describe('ng-add', () => {
  let workspaceTree: UnitTestTree;
  const testRunner = new SchematicTestRunner('single-spa-angular', collectionPath);

  async function generateApplication(name: string, project?: string) {
    await testRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        {
          name,
          project,
          routing: true,
          skipTests: true,
          style: 'scss',
        },
        workspaceTree,
      )
      .toPromise();
  }

  beforeEach(async () => {
    // Generate workspace w/o application.
    workspaceTree = await testRunner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
  });

  test('should create 2 apps in an empty workspace and generate appropriate scripts', async () => {
    // Arrange & act
    await generateApplication('first-cool-app', 'first-cool-app');
    await generateApplication('second-cool-app', 'second-cool-app');

    await testRunner
      .runSchematicAsync('ng-add', { project: 'first-cool-app' }, workspaceTree)
      .toPromise();

    const tree = await testRunner
      .runSchematicAsync('ng-add', { project: 'second-cool-app' }, workspaceTree)
      .toPromise();

    const { scripts } = JSON.parse(tree.get('/package.json')!.content.toString());

    // Assert
    expect(scripts['build:single-spa:first-cool-app']).toBe(
      'ng build first-cool-app --prod --deploy-url http://localhost:4200/',
    );
    expect(scripts['serve:single-spa:first-cool-app']).toBe(
      'ng s --project first-cool-app --disable-host-check --port 4200 --deploy-url http://localhost:4200/ --live-reload false',
    );

    expect(scripts['build:single-spa:second-cool-app']).toBe(
      'ng build second-cool-app --prod --deploy-url http://localhost:4201/',
    );
    expect(scripts['serve:single-spa:second-cool-app']).toBe(
      'ng s --project second-cool-app --disable-host-check --port 4201 --deploy-url http://localhost:4201/ --live-reload false',
    );
  });

  test('should create 2 apps but one app should be default and second one is additional', async () => {
    // Arrange & act
    await generateApplication('default-project');
    await generateApplication('additional-project', 'additional-project');

    await testRunner.runSchematicAsync('ng-add', undefined, workspaceTree).toPromise();

    const tree = await testRunner
      .runSchematicAsync('ng-add', { project: 'additional-project' }, workspaceTree)
      .toPromise();

    const { scripts } = JSON.parse(tree.get('/package.json')!.content.toString());

    // Arrange
    expect(scripts['build:single-spa']).toBe('ng build --prod --deploy-url http://localhost:4200/');
    expect(scripts['serve:single-spa']).toBe(
      'ng s --disable-host-check --port 4200 --deploy-url http://localhost:4200/ --live-reload false',
    );

    expect(scripts['build:single-spa:additional-project']).toBe(
      'ng build additional-project --prod --deploy-url http://localhost:4201/',
    );
    expect(scripts['serve:single-spa:additional-project']).toBe(
      'ng s --project additional-project --disable-host-check --port 4201 --deploy-url http://localhost:4201/ --live-reload false',
    );
  });
});
