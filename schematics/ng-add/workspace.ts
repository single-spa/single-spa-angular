import { parse } from 'json5';
import { SchematicsException, Tree } from '@angular-devkit/schematics';

export function getWorkspacePath(host: Tree): string {
  const possibleFiles = ['/angular.json', '/.angular.json'];
  const [path] = possibleFiles.filter(path => host.exists(path));
  return path;
}

export function getWorkspace(host: Tree) {
  const path = getWorkspacePath(host);
  const buffer = host.read(path);
  if (buffer === null) {
    throw new SchematicsException(`Could not find (${path})`);
  }
  const json = buffer.toString();
  return parse(json);
}
