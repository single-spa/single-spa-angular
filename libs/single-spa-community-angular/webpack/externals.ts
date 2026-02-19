// This is used to add all Angular related packages to Webpack externals so they will not be
// bundled when dependencies are shared.
// Note: we need to specify packages explicitly w/o wildcards (e.g. /@angular\/*/). The developer
// may have an alias that also starts with `@angular/`, this may lead to unexpected behavior.
export const externals = [
  'rxjs',
  'rxjs/operators',

  '@angular/animations',
  '@angular/animations/browser',

  '@angular/common',
  '@angular/common/http',
  '@angular/common/upgrade',

  '@angular/compiler',

  '@angular/core/primitives/signals',
  '@angular/core/primitives/event-dispatch',
  '@angular/core/primitives/di',
  '@angular/core',
  '@angular/core/rxjs-interop',

  '@angular/elements',

  '@angular/forms',
  '@angular/forms/signals',
  '@angular/forms/signals/compat',

  '@angular/localize',
  '@angular/localize/init',

  '@angular/platform-browser',
  '@angular/platform-browser/animations',
  '@angular/platform-browser/animations/async',

  '@angular/platform-browser-dynamic',

  '@angular/router',
  '@angular/router/upgrade',

  '@angular/service-worker',
  '@angular/service-worker/config',

  '@angular/upgrade',
  '@angular/upgrade/static',

  'single-spa',
  '@single-spa-community/angular/internals',
  '@single-spa-community/angular',
  '@single-spa-community/angular/elements',
  '@single-spa-community/angular/parcel',
];
