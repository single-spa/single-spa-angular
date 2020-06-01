import { LifeCycles } from 'single-spa';
import { NgElement } from '@angular/elements';

import {
  SingleSpaAngularElementsOptions,
  BootstrappedSingleSpaAngularElementsOptions,
} from './types';

const defaultOptions: BootstrappedSingleSpaAngularElementsOptions = {
  element: null!,
  ngModuleRef: null,
  bootstrapFunction: null!,
  withProperties: undefined,
  domElementGetter: undefined,
};

async function bootstrap(options: BootstrappedSingleSpaAngularElementsOptions) {
  if (options.ngModuleRef !== null) {
    return;
  }

  options.ngModuleRef = await options.bootstrapFunction();
}

async function mount(options: BootstrappedSingleSpaAngularElementsOptions) {
  if (typeof options.withProperties === 'function') {
    const properties = await options.withProperties(options.ngModuleRef!);
    const element = document.querySelector(options.element) as NgElement;

    for (const [property, value] of Object.entries(properties)) {
      element[property] = value;
    }
  }
}

function unmount(options: BootstrappedSingleSpaAngularElementsOptions) {
  const node = document.querySelector(options.element);
  // Removing custom element from DOM is enough since it will trigger
  // `disconnectedCallback()` and Angular will dispose all resources.
  node?.parentElement?.removeChild(node);
  return Promise.resolve();
}

export function singleSpaAngularElements(userOptions: SingleSpaAngularElementsOptions): LifeCycles {
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
