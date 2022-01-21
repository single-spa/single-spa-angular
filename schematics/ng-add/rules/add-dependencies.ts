import * as https from 'https';
import { IncomingMessage } from 'http';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

export function addDependencies(): Rule {
  const dependencies: Array<NodeDependency | Promise<NodeDependency>> = [
    getSingleSpaDependency(),
    getSingleSpaAngularDependency(),
    getStyleLoaderDependency(),
    getAngularBuildersCustomWebpackDependency(),
  ];

  return async (tree: Tree, context: SchematicContext) => {
    for await (const dependency of dependencies) {
      addPackageJsonDependency(tree, dependency);
      context.logger.info(`Added '${dependency.name}' as a dependency`);
    }
  };
}

interface PackageJson {
  version: string;
  peerDependencies?: {
    'single-spa'?: string;
    'style-loader'?: string;
  };
  dependencies?: {
    'single-spa'?: string;
    'style-loader'?: string;
  };
}

const { version, peerDependencies, dependencies }: PackageJson = require('../../../package.json');

function getSingleSpaDependency(): NodeDependency {
  const singleSpaVersion =
    peerDependencies?.['single-spa'] || dependencies?.['single-spa'] || 'latest';

  return {
    name: 'single-spa',
    version: singleSpaVersion,
    overwrite: true,
    type: NodeDependencyType.Default,
  };
}

function getSingleSpaAngularDependency(): NodeDependency {
  return {
    name: 'single-spa-angular',
    version,
    overwrite: false,
    type: NodeDependencyType.Default,
  };
}

function getStyleLoaderDependency(): NodeDependency {
  return {
    name: 'style-loader',
    overwrite: false,
    type: NodeDependencyType.Dev,
    version: peerDependencies?.['style-loader'] || dependencies?.['style-loader'] || 'latest',
  };
}

async function getAngularBuildersCustomWebpackDependency(): Promise<NodeDependency> {
  return {
    name: '@angular-builders/custom-webpack',
    overwrite: false,
    type: NodeDependencyType.Dev,
    version: await resolveCustomWebpackVersion(),
  };
}

async function resolveCustomWebpackVersion(): Promise<string> {
  let version: string;

  try {
    const major = await resolveAngularMajorVersion();
    const versions: string[] = await getCustomWebpackVersions();
    // Let's try to get all versions that might match the current major Angular version.
    // This can be:
    // `['12.0.0-beta.0', '12.0.0', '12.0.1-beta.0']`
    const majorVersions = versions.filter(version => version.startsWith(major));
    const majorBetaVersions = majorVersions.filter(version => version.match(/-beta/) !== null);
    const majorStableVersions = majorVersions.filter(version => version.match(/-beta/) === null);

    // Well, we'd want to use the stable version first of all, for instance, `12.0.0`, and if
    // no stable version is available, then we fall back to the beta version.
    // This can happen when the new Angular version is out and the `@angular-builders/custom-webpack`
    // hasn't released the stable compatible version yet.
    version = majorStableVersions.pop() || majorBetaVersions.pop() || 'latest';
  } catch {
    // We could actually initialize version with the `latest` value,
    // but let's be more imperative and fallback to the `latest` value
    // if any exception has occured previously.
    version = 'latest';
  }

  return version;
}

function getCustomWebpackVersions(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const request = https.get(
      {
        protocol: 'https:',
        hostname: 'registry.npmjs.com',
        path: '/@angular-builders/custom-webpack',
      },
      (response: IncomingMessage) => {
        const chunks: Buffer[] = [];

        response
          .on('error', reject)
          .on('data', chunk => {
            chunks.push(chunk);
          })
          .on('end', () => {
            const response = JSON.parse(`${Buffer.concat(chunks)}`);
            const versions: string[] = Object.keys(response.versions);
            resolve(versions);
          });
      },
    );

    request.on('error', reject).end();
  });
}

async function resolveAngularMajorVersion(): Promise<string> {
  if (typeof jest !== 'undefined') {
    return (await import('@angular/core')).VERSION.major;
  } else {
    // Caretaker note: Angular 13 is no longer shipped with UMD bundles. It exports `.mjs` files only.
    // Thus `require('@angular/core')` throws an exception that `Must use import to load ES Module`.

    // The `await import('@angular/core')` is transformed by the TS compiler into this:
    // `yield Promise.resolve().then(() => require('@angular/core'))`.
    return (await Function('return import("@angular/core")')()).VERSION.major;
  }
}
