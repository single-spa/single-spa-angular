import * as https from 'https';
import { IncomingMessage } from 'http';
import { VERSION } from '@angular/core';
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

export async function getAngularBuildersCustomWebpackDependency(): Promise<NodeDependency> {
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
    const versions: string[] = await getCustomWebpackVersions();
    // We do `filter` because there can be `beta` versions, thus `^11`
    // will not work in that case.
    const compatibleMajorVersions: string[] = versions.filter(version =>
      version.startsWith(VERSION.major),
    );

    version = compatibleMajorVersions.pop() || 'latest';
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
