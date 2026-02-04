/**
 * Merged entry point for @angular/platform-browser and its animation modules
 * 
 * Angular 20+ uses chunked ESM output in fesm2022/, where shared internal
 * modules (like DomRendererFactory2) are extracted into separate files.
 * When bundling platform-browser.mjs, animations.mjs, and animations/async.mjs
 * separately for SystemJS, these shared chunks get duplicated, causing class
 * reference mismatches at runtime.
 * 
 * This wrapper merges all three exports into a single bundle, ensuring shared
 * code is only included once and all class references point to the same
 * constructor.
 */
export * from '@angular/platform-browser';
export * from '@angular/platform-browser/animations';
export * from '@angular/platform-browser/animations/async';
