import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const bundlePath = join(__dirname, 'es2022/angular-core-full.js');

// postinstall builds the bundle. Skip when it was not built.
const testIfBuilt = existsSync(bundlePath) ? test : test.skip;

function loadSystemBundleExports(file: string): Record<string, unknown> {
  let declare: any;
  let dependencies: string[] = [];
  const System = {
    register: (deps: string[], fn: any) => {
      dependencies = deps;
      declare = fn;
    },
  };
  new Function('System', readFileSync(file, 'utf8'))(System);

  const exported: Record<string, unknown> = {};
  const _export = (name: string | Record<string, unknown>, value?: unknown) => {
    if (typeof name === 'string') {
      exported[name] = value;
    } else {
      Object.assign(exported, name);
    }
    return value;
  };

  // The bundle sets its exports only when execute() runs.
  const { setters, execute } = declare(_export, { meta: {} });
  dependencies.forEach((dependency, index) => setters[index](require(dependency)));
  execute();

  return exported;
}

describe('SystemJS @angular/core bundle', () => {
  testIfBuilt('should export the Attribute decorator from @angular/core', () => {
    const exported = loadSystemBundleExports(bundlePath);

    expect(typeof exported.Attribute).toBe('function');
  });
});
