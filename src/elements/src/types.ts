import { NgModuleRef } from '@angular/core';
import { NgElement } from '@angular/elements';
import { BaseSingleSpaAngularOptions } from 'single-spa-angular/internals';

export interface SingleSpaAngularElementsOptions extends BaseSingleSpaAngularOptions {
  bootstrapFunction(): Promise<NgModuleRef<any>>;
  // It's possible to pass `@Input()` data to Angular custom element
  // because custom element is basically a virtual component that has
  // setters for all `@Input()` properties.
  // Basically directly:
  // const element = document.querySelector('app-custom-element');
  // element.someInputProperty = 10;
  withProperties?(ngModuleRef: NgModuleRef<any>): object | Promise<object>;
}

export interface BootstrappedSingleSpaAngularElementsOptions
  extends SingleSpaAngularElementsOptions {
  ngModuleRef: NgModuleRef<any> | null;
  // This will be an actual custom element.
  element: NgElement | null;
}
