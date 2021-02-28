import { UnitTestTree } from '@angular-devkit/schematics/testing';

import { Schema as NgAddOptions } from '../schema';
import { createTestRunner, createWorkspace } from './utils';

const workspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '9.0.0',
};

describe('https://github.com/single-spa/single-spa-angular/issues/341', () => {
  let appTree: UnitTestTree;
  const testRunner = createTestRunner();

  beforeEach(async () => {
    appTree = await createWorkspace(testRunner, appTree, workspaceOptions, {
      name: 'first-cool-app',
    });
  });

  test('should show warning if routing is enabled', async () => {
    // Arrange
    const messages: string[] = [];
    const subscription = testRunner.logger.subscribe(({ message }) => {
      messages.push(message);
    });

    // Act
    appTree = await testRunner
      .runSchematicAsync<NgAddOptions>('ng-add', { routing: true }, appTree)
      .toPromise();

    subscription.unsubscribe();

    // Assert
    expect(
      messages.find(message =>
        message.includes('Warning: Since the routing is enabled an additional manual'),
      ),
    ).toBeTruthy();
  });
});
