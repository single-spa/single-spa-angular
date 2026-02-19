import url from 'node:url';
import path from 'node:path';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { createEs2015LinkerPlugin } from '@angular/compiler-cli/linker/babel';
import { ConsoleLogger, NodeJSFileSystem, LogLevel } from '@angular/compiler-cli';

const __dirname = new url.URL('.', import.meta.url).pathname;

/** File system used by the Angular linker plugin. */
const fileSystem = new NodeJSFileSystem();
/** Logger used by the Angular linker plugin. */
const logger = new ConsoleLogger(LogLevel.info);
/**
 * The linker plugin is used to make output files AOT compatible, so they don't
 * require the `@angular/compiler` at runtime.
 */
const linkerPlugin = createEs2015LinkerPlugin({
  fileSystem,
  logger,
  linkerJitMode: false,
});

const packages = ['2022']
  .map(ecma => [
    {
      ecma,
      angularPackage: '@single-spa-community/angular/internals',
      filename: 'single-spa-community-angular-internals',
    },
    {
      ecma,
      angularPackage: '@single-spa-community/angular',
      filename: 'single-spa-community-angular',
    },
    {
      ecma,
      angularPackage: '@single-spa-community/angular/elements',
      filename: 'single-spa-community-angular-elements',
    },
    {
      ecma,
      angularPackage: '@single-spa-community/angular/parcel',
      filename: 'single-spa-community-angular-parcel',
    },
  ])
  .flat();

export default packages
  .map(({ ecma, filename }) => [
    createConfig({
      ecma,
      prod: false,
      format: 'system',
      filename,
    }),
    createConfig({
      ecma,
      prod: true,
      format: 'system',
      filename,
    }),
  ])
  .flat();

function createConfig({ ecma, prod, format, filename }) {
  const dir = (format === 'es' ? '.' : format) + `/es${ecma}`;

  return {
    input: path.join(__dirname, `../lib/fesm${ecma}/${filename}.mjs`),
    output: {
      file: `${dir}/${filename}.${prod ? 'min.' : ''}js`,
      format,
      sourcemap: true,
    },
    plugins: [
      nodeResolve({ browser: true }),
      babel({ plugins: [linkerPlugin] }),
      prod &&
        terser({
          format: {
            ecma,
            comments: /esm-bundle/,
          },
          compress: {
            global_defs: {
              ngJitMode: false,
              ngDevMode: false,
              ngI18nClosureMode: false,
            },
          },
        }),
    ],
    external: [
      'rxjs',
      'rxjs/operators',
      '@angular/core',
      '@angular/common',
      '@single-spa-community/angular/internals',
    ],
  };
}
