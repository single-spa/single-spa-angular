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

  // We call `bootstrapFunction()` inside the bootstrap lifecycle hook
  // because Angular modules that expose custom elements should be
  // bootstrapped only once.
  options.ngModuleRef = await options.bootstrapFunction();
}

async function mount(options: BootstrappedSingleSpaAngularElementsOptions) {
  if (typeof options.withProperties !== 'function') {
    return;
  }

  const properties = await options.withProperties(options.ngModuleRef!);
  const element = document.querySelector(options.element) as NgElement;

  for (const [property, value] of Object.entries(properties)) {
    element[property] = value;
  }
}

function unmount(options: BootstrappedSingleSpaAngularElementsOptions) {
  return Promise.resolve().then(() => {
    const node: HTMLElement | null = document.querySelector(options.element);

    if (node !== null) {
      // Removing custom element from DOM is enough since it will trigger
      // `disconnectedCallback()` and Angular will dispose all resources.
      node.parentElement!.removeChild(node);
    } else {
      throw Error(`Could not find Angular element with selector ${options.element}`);
    }
  });
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
