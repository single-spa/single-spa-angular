import type { ApplicationRef, NgModuleRef } from '@angular/core';
import type { NgElement } from '@angular/elements';
import type { BaseSingleSpaAngularOptions } from '@single-spa-community/angular/internals';

export interface BootstrappedSingleSpaAngularElementsOptions extends BaseSingleSpaAngularOptions {
  ngModuleRefOrAppRef: NgModuleRef<any> | ApplicationRef | null;
  // This will be an actual custom element.
  element: NgElement | null;
}
