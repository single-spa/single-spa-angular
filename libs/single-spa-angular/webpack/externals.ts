// This is used to add all Angular related packages to Webpack externals so they will not be
// bundled when dependencies are shared.
// Note: we need to specify packages explicitly w/o wildcards (e.g. /@angular\/*/). The developer
// may have an alias that also starts with `@angular/`, this may lead to unexpected behavior.
export const externals = [
  'rxjs',
  'rxjs/operators',

  '@angular/core',
  '@angular/compiler',

  '@angular/common',
  '@angular/common/http',
  '@angular/common/upgrade',

  '@angular/platform-browser',
  '@angular/platform-browser/animations',

  '@angular/platform-browser-dynamic',

  '@angular/router',
  '@angular/router/upgrade',

  '@angular/animations',
  '@angular/animations/browser',

  '@angular/forms',

  '@angular/elements',

  '@angular/upgrade',
  '@angular/upgrade/static',

  '@angular/service-worker',
  '@angular/service-worker/config',

  '@angular/localize',
  '@angular/localize/init',

  'single-spa',
  'single-spa-angular/internals',
  'single-spa-angular',
  'single-spa-angular/elements',
  'single-spa-angular/parcel',
];
