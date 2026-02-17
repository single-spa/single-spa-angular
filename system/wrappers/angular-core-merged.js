/**
 * Merged entry point for @angular/core and its modules
 * 
 * Angular 20+ uses chunked ESM output in fesm2022/, where shared internal
 * modules are extracted into separate files.
 * When bundling core.mjs, primitives, rxjs-interop
 * separately for SystemJS, these shared chunks get duplicated, causing class
 * reference mismatches at runtime.
 * 
 * This wrapper merges all three exports into a single bundle, ensuring shared
 * code is only included once and all class references point to the same
 * constructor.
 */
export * from '@angular/core';
export * from '@angular/core/primitives/signals';
export * from '@angular/core/primitives/di';
export * from '@angular/core/rxjs-interop';
export * from '@angular/core/primitives/event-dispatch';
