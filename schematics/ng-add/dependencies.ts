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

/**
 * We have to install `@angular-builders/custom-webpack` version compatible with the current
 * version of Angular. If Angular is 8 then `custom-webpack@8.4.1` has to be installed.
 */
export function getAngularBuildersCustomWebpackDependency(): NodeDependency {
  const { VERSION } = require('@angular/core');

  return {
    name: '@angular-builders/custom-webpack',
    version: `^${VERSION.major}`,
    overwrite: false,
    type: NodeDependencyType.Dev,
  };
}
