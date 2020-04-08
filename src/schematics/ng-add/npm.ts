import * as http from 'http';
import { NodeDependencyType, NodeDependency } from '@schematics/angular/utility/dependencies';

const LATEST_COMPATIBLE_CUSTOM_WEBPACK_VERSIONS = {
  // `8.4.1` is the latest version of `@angular-builders/custom-webpack`
  // that is compatible with Angular 8 and will not change anymore because
  // 9 version is in active development. We will need to consider choosing
  // `@angular-builders/custom-webpack` based on the currently used Angular
  // version.
  8: '8.4.1',
};

/**
 * Actually, there is the `latest-version` package that does the
 * same stuff, but we'd want these schematics to be lightweight and
 * less dependent on other packages.
 */
function getLatestNodeVersion(name: string) {
  return new Promise<string>(resolve => {
    const defaultVersion = 'latest';

    const req = http.get(`http://registry.npmjs.org/${name}`, res => {
      const chunks: Uint8Array[] = [];

      res.on('data', chunk => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString();
          const json = JSON.parse(body);
          const tags = json['dist-tags'];
          resolve(tags.latest);
        } catch {
          resolve(defaultVersion);
        }
      });
    });

    req.on('error', () => resolve(defaultVersion));
    req.end();
  });
}

/**
 * We're interested in installing the latest `single-spa-angular` version.
 */
export async function getSingleSpaAngularDependency(): Promise<NodeDependency> {
  const name = 'single-spa-angular';
  const version = await getLatestNodeVersion(name);

  return {
    name,
    version,
    overwrite: false,
    type: NodeDependencyType.Default,
  };
}

/**
 * We have to install `@angular-builders/custom-webpack` version compatible with the current
 * version of Angular. If Angular is 8 then `custom-webpack@8.4.1` has to be installed.
 */
export async function getAngularBuildersCustomWebpackDependency(): Promise<NodeDependency> {
  const { VERSION } = require('@angular/core');
  const name = '@angular-builders/custom-webpack';

  const version =
    LATEST_COMPATIBLE_CUSTOM_WEBPACK_VERSIONS[VERSION.major] || (await getLatestNodeVersion(name));

  return {
    name,
    version,
    overwrite: false,
    type: NodeDependencyType.Dev,
  };
}
