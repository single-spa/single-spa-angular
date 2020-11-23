import { NodeDependencyType, NodeDependency } from '@schematics/angular/utility/dependencies';

interface PackageJson {
  version: string;
  peerDependencies?: {
    'single-spa': string;
  };
  dependencies?: {
    'single-spa': string;
  };
}

const { version, peerDependencies, dependencies }: PackageJson = require('../../package.json');

export function getSingleSpaDependency(): NodeDependency {
  const singleSpaVersion =
    peerDependencies?.['single-spa'] || dependencies?.['single-spa'] || 'latest';

  return {
    name: 'single-spa',
    version: singleSpaVersion,
    overwrite: true,
    type: NodeDependencyType.Default,
  };
}

export function getSingleSpaAngularDependency(): NodeDependency {
  return {
    name: 'single-spa-angular',
    version,
    overwrite: false,
    type: NodeDependencyType.Default,
  };
}

export function getAngularBuildersCustomWebpackDependency(): NodeDependency {
  return {
    name: '@angular-builders/custom-webpack',
    // Relying on the current major version of Angular is wrong.
    // We have to install the `latest` version because we cannot know
    // when the new version will be published.
    version: 'latest',
    overwrite: false,
    type: NodeDependencyType.Dev,
  };
}
