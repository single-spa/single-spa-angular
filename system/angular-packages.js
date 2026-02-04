import { join, dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const nodeModulesPath = resolve(__dirname, '../node_modules');

const pkg = name => require(`${name}/package.json`);
const fesm = path => join(nodeModulesPath, `${path}/fesm2022`);
const wrapper = file => join(__dirname, `wrappers/${file}`);

const angularPackages = [
  // tslib
  {
    name: 'tslib',
    input: join(nodeModulesPath, 'tslib/tslib.es6.js'),
    outputFile: 'tslib',
    packageJson: pkg('tslib'),
    external: [],
  },

  // @angular/animations
  {
    name: '@angular/animations',
    input: `${fesm('@angular/animations')}/animations.mjs`,
    outputFile: 'angular-animations',
    packageJson: pkg('@angular/animations'),
    external: ['@angular/core'],
  },
  {
    name: '@angular/animations/browser',
    input: `${fesm('@angular/animations')}/browser.mjs`,
    outputFile: 'angular-animations-browser',
    packageJson: pkg('@angular/animations'),
    external: ['@angular/core'],
  },

  // @angular/common (merged with http)
  {
    name: '@angular/common-with-http',
    input: wrapper('angular-common-merged.js'),
    outputFile: 'angular-common-full',
    packageJson: pkg('@angular/common'),
    external: ['@angular/core'],
  },

  // @angular/compiler
  {
    name: '@angular/compiler',
    input: `${fesm('@angular/compiler')}/compiler.mjs`,
    outputFile: 'angular-compiler',
    packageJson: pkg('@angular/compiler'),
    external: ['rxjs', 'rxjs/operators'],
  },

  // @angular/core primitives
  {
    name: '@angular/core/primitives/event-dispatch',
    input: `${fesm('@angular/core')}/primitives/event-dispatch.mjs`,
    outputFile: 'angular-core-primitives-event-dispatch',
    packageJson: pkg('@angular/core'),
    external: [],
  },
  {
    name: '@angular/core/primitives/signals',
    input: `${fesm('@angular/core')}/primitives/signals.mjs`,
    outputFile: 'angular-core-primitives-signals',
    packageJson: pkg('@angular/core'),
    external: [],
  },
  {
    name: '@angular/core/primitives/di',
    input: `${fesm('@angular/core')}/primitives/di.mjs`,
    outputFile: 'angular-core-primitives-di',
    packageJson: pkg('@angular/core'),
    external: [],
  },

  // @angular/core
  {
    name: '@angular/core',
    input: `${fesm('@angular/core')}/core.mjs`,
    outputFile: 'angular-core',
    packageJson: pkg('@angular/core'),
    external: ['@angular/core/primitives/signals', '@angular/core/primitives/di'],
  },
  {
    name: '@angular/core/rxjs-interop',
    input: `${fesm('@angular/core')}/rxjs-interop.mjs`,
    outputFile: 'angular-core-rxjs-interop',
    packageJson: pkg('@angular/core'),
    external: ['@angular/core/primitives/signals', '@angular/core/primitives/di'],
  },

  // @angular/elements
  {
    name: '@angular/elements',
    input: `${fesm('@angular/elements')}/elements.mjs`,
    outputFile: 'angular-elements',
    packageJson: pkg('@angular/elements'),
    external: ['@angular/core'],
  },

  // @angular/forms
  {
    name: '@angular/forms',
    input: `${fesm('@angular/forms')}/forms.mjs`,
    outputFile: 'angular-forms',
    packageJson: pkg('@angular/forms'),
    external: ['@angular/core', '@angular/common'],
  },

  // @angular/platform-browser (merged with animations)
  {
    name: '@angular/platform-browser-full',
    input: wrapper('angular-platform-browser-merged.js'),
    outputFile: 'angular-platform-browser-full',
    packageJson: pkg('@angular/platform-browser'),
    external: ['@angular/core', '@angular/common', '@angular/animations/browser'],
  },

  // @angular/platform-browser-dynamic
  {
    name: '@angular/platform-browser-dynamic',
    input: `${fesm('@angular/platform-browser-dynamic')}/platform-browser-dynamic.mjs`,
    outputFile: 'angular-platform-browser-dynamic',
    packageJson: pkg('@angular/platform-browser-dynamic'),
    external: ['@angular/core', '@angular/compiler', '@angular/platform-browser'],
  },

  // @angular/router
  {
    name: '@angular/router',
    input: `${fesm('@angular/router')}/router.mjs`,
    outputFile: 'angular-router',
    packageJson: pkg('@angular/router'),
    external: ['@angular/core', '@angular/common', '@angular/platform-browser'],
  },
];

// Add rxjs to all externals
angularPackages.forEach(p => p.external.unshift(/rxjs/));

export { angularPackages };
