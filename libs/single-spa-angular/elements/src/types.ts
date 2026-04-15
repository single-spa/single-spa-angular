import { ApplicationRef, NgModuleRef } from '@angular/core';
import { NgElement } from '@angular/elements';
import { BaseSingleSpaAngularOptions } from 'single-spa-angular/internals';

export interface BootstrappedSingleSpaAngularElementsOptions extends BaseSingleSpaAngularOptions {
  ngModuleRefOrAppRef: NgModuleRef<any> | ApplicationRef | null;
  // This will be an actual custom element.
  element: NgElement | null;
}
