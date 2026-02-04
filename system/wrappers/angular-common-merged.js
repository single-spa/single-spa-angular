/**
 * Merged entry point for @angular/common and @angular/common/http
 * 
 * Angular 20+ uses chunked ESM output in fesm2022/, where shared internal
 * modules (like xhr.mjs with XhrFactory) are extracted into separate files.
 * When bundling common.mjs and http.mjs separately for SystemJS, these
 * shared chunks get duplicated, causing class reference mismatches at runtime.
 * 
 * This wrapper merges both exports into a single bundle, ensuring shared
 * code is only included once and all class references point to the same
 * constructor.
 */
export * from '@angular/common';
export * from '@angular/common/http';
