import { workspaces } from '@angular-devkit/core';
import { SchematicsException } from '@angular-devkit/schematics';

export function getBuildTarget(
  project: workspaces.ProjectDefinition,
): workspaces.TargetDefinition | never {
  const buildTarget = project.targets.get('build');

  if (!buildTarget) {
    throw new SchematicsException(`Project target "build" not found.`);
  }

  return buildTarget;
}
