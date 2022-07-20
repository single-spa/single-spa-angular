import { LifeCycles } from 'single-spa';
import { NgElement } from '@angular/elements';
import {
  BaseSingleSpaAngularOptions,
  getContainerElementAndSetTemplate,
} from 'single-spa-angular/internals';

import { BootstrappedSingleSpaAngularElementsOptions } from './types';

const defaultOptions: BootstrappedSingleSpaAngularElementsOptions = {
  element: null,
  template: null!,
  ngModuleRefOrAppRef: null,
  bootstrapFunction: null!,
  domElementGetter: undefined,
};

async function bootstrap(options: BootstrappedSingleSpaAngularElementsOptions, props: any) {
  if (options.ngModuleRefOrAppRef !== null) {
    return;
  }

  // We call `bootstrapFunction()` inside the bootstrap lifecycle hook
  // because Angular modules that expose custom elements should be
  // bootstrapped only once.
  options.ngModuleRefOrAppRef = await options.bootstrapFunction(props);
}

async function mount(options: BootstrappedSingleSpaAngularElementsOptions, props: any) {
  const containerElement = getContainerElementAndSetTemplate(options, props);
  // `options.template` which can be `<app-element />` is not a valid selector
  // for `document.querySelector`, thus we retrieve this custom element
  // via this property.
  options.element = containerElement.firstElementChild as NgElement;
}

function unmount(options: BootstrappedSingleSpaAngularElementsOptions): Promise<void> {
  return Promise.resolve().then(() => {
    // Removing custom element from DOM is enough since it will trigger
    // `disconnectedCallback()` and Angular will dispose all resources.
    options.element!.parentElement!.removeChild(options.element!);
    options.element = null;
  });
}

export function singleSpaAngularElements(userOptions: BaseSingleSpaAngularOptions): LifeCycles {
  const options: BootstrappedSingleSpaAngularElementsOptions = {
    ...defaultOptions,
    ...userOptions,
  };

  return {
    bootstrap: bootstrap.bind(null, options),
    mount: mount.bind(null, options),
    unmount: unmount.bind(null, options),
  };
}
