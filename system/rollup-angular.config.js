import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import { createEs2015LinkerPlugin } from '@angular/compiler-cli/linker/babel';
import { ConsoleLogger, NodeJSFileSystem, LogLevel } from '@angular/compiler-cli';
import nodeResolve from '@rollup/plugin-node-resolve';
import { angularPackages } from './angular-packages.js';

const linkerPlugin = createEs2015LinkerPlugin({
  fileSystem: new NodeJSFileSystem(),
  logger: new ConsoleLogger(LogLevel.info),
  linkerJitMode: false,
});

function createConfig({ input, outputFile, external, prod }) {
  return {
    input,
    output: {
      file: `system/es2022/${outputFile}.${prod ? 'min.' : ''}js`,
      format: 'system',
    },
    plugins: [
      babel({ plugins: [linkerPlugin] }),
      nodeResolve({
        resolveOnly: [/^@angular\//, /^tslib$/],
      }),
      prod &&
        terser({
          format: { ecma: '2022' },
          compress: {
            global_defs: {
              ngJitMode: false,
              ngDevMode: false,
              ngI18nClosureMode: false,
            },
          },
        }),
    ],
    external,
  };
}

export default angularPackages.flatMap(pkg => [
  createConfig({ ...pkg, prod: false }),
  createConfig({ ...pkg, prod: true }),
]);
