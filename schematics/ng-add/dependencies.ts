import { NodeDependencyType, NodeDependency } from '@schematics/angular/utility/dependencies';

export function getSingleSpaAngularDependency(): NodeDependency {
  return {
    name: 'single-spa-angular',
    version: require('../../package.json').version,
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
