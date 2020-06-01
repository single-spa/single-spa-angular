import { NgModuleRef } from '@angular/core';
import { WithProperties } from '@angular/elements';

export interface SingleSpaAngularElementsOptions {
  // This has to be tag name, something like `element: 'my-app'`,
  // because we would want to access this element through DOM API
  // and set input properties.
  element: string;
  bootstrapFunction(): Promise<NgModuleRef<any>>;
  // It's possible to pass `@Input()` data to Angular custom element
  // because custom element is basically a virtual component that has
  // setters for all `@Input()` properties.
  // Basically directly:
  // const element = document.querySelector('app-custom-element');
  // element.someInputProperty = 10;
  withProperties?<P>(ngModuleRef: NgModuleRef<any>): WithProperties<P> | Promise<WithProperties<P>>;
  domElementGetter?(): HTMLElement;
}

export interface BootstrappedSingleSpaAngularElementsOptions
  extends SingleSpaAngularElementsOptions {
  ngModuleRef: NgModuleRef<any> | null;
}
