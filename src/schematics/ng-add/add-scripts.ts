import { Tree } from '@angular-devkit/schematics';

const DEFAULT_PORT = 4200;

interface Scripts {
  [script: string]: string;
}

/**
 * The user can have multiple applications inside the same workspace.
 * E.g. consider following commands:
 *
 * - `yarn ng new --createApplication false workspace`
 * - `yarn ng generate application first-cool-app`
 * - `yarn ng generate application second-cool-app`
 * - `yarn ng add single-spa-angular --project first-cool-app`
 * - `yarn ng add single-spa-angular --project second-cool-app`
 *
 * In that case our schematics should respect passed `--project` argument.
 * Basically it will create different scripts for different applications, thus the
 * user will be able to run them in parallel. Created scripts will be:
 *
 * - build:single-spa:first-cool-app
 * - serve:single-spa:first-cool-app
 *
 * - build:single-spa:second-cool-app
 * - serve:single-spa:second-cool-app
 */
export function addScripts(
  tree: Tree,
  pkgPath: string,
  pkg: any,
  project: string | undefined,
): void {
  if (project) {
    addScriptsForTheSpecificProject(pkg, project);
  } else {
    addDefaultScripts(pkg);
  }

  tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
}

function addScriptsForTheSpecificProject(pkg: any, project: string): void {
  const port = parseExistingScriptsAndChoosePort(pkg.scripts);

  pkg.scripts[
    `build:single-spa:${project}`
  ] = `ng build ${project} --prod --deploy-url http://localhost:${port}/`;

  pkg.scripts[
    `serve:single-spa:${project}`
  ] = `ng s --project ${project} --disable-host-check --port ${port} --deploy-url http://localhost:${port}/ --live-reload false`;
}

/**
 * In that case the user didn't provide any `--project` argument, that probably means
 * that he has a single project in his workspace and we want to provide a default script.
 */
function addDefaultScripts(pkg: any): void {
  pkg.scripts[
    'build:single-spa'
  ] = `ng build --prod --deploy-url http://localhost:${DEFAULT_PORT}/`;

  pkg.scripts[
    'serve:single-spa'
  ] = `ng s --disable-host-check --port ${DEFAULT_PORT} --deploy-url http://localhost:${DEFAULT_PORT}/ --live-reload false`;
}

function parseExistingScriptsAndChoosePort(scripts: Scripts): number {
  const collectedScripts: string[] = collectExistingServeSingleSpaScripts(scripts);
  // For instance `[4200, 4201, 4202]`.
  const ports: number[] = getPortsFromCollectedScripts(collectedScripts);

  if (ports.length === 0) {
    return DEFAULT_PORT;
  }

  const lastPort = ports.pop();
  // `4202 + 1 -> 4203` next port for the new project.
  return lastPort! + 1;
}

function collectExistingServeSingleSpaScripts(scripts: Scripts): string[] {
  return Object.keys(scripts)
    .filter(key => key.startsWith('serve:single-spa'))
    .map(key => scripts[key]);
}

function getPortsFromCollectedScripts(collectedScripts: string[]): number[] {
  return (
    collectedScripts
      .reduce((ports: number[], script: string) => {
        const match: RegExpMatchArray | null = script.match(/--port \d+/);

        if (match !== null) {
          // `match[0]` will be a string e.g. `--port 4200`,
          // we split by space to get that `4200`.
          const [, port] = match[0].split(' ');
          ports.push(+port);
        }

        return ports;
      }, <number[]>[])
      // Sorts all numbers for ascending order. For example we will get
      // `[4200, 4201, 4202]` sorted numbers. We will need `4202` to get next port.
      .sort()
  );
}
