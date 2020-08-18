import { LifeCycles } from 'single-spa';
import { NgElement } from '@angular/elements';
import { chooseDomElementGetter, getContainerElement } from 'single-spa-angular/internals';

import {
  SingleSpaAngularElementsOptions,
  BootstrappedSingleSpaAngularElementsOptions,
} from './types';

const defaultOptions: BootstrappedSingleSpaAngularElementsOptions = {
  element: null,
  template: null!,
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

async function mount(options: BootstrappedSingleSpaAngularElementsOptions, props: any) {
  const domElementGetter = chooseDomElementGetter(options, props);

  if (!domElementGetter) {
    throw Error(
      `cannot mount angular application '${
        props.name || props.appName
      }' without a domElementGetter provided either as an opt or a prop`,
    );
  }

  const containerElement: HTMLElement = getContainerElement(domElementGetter);
  containerElement.innerHTML = options.template;

  // `options.element` which can be `<app-element />` is not a valid selector
  // for `document.querySelector`, thus we retrieve this custom element
  // via this property.
  options.element = containerElement.firstElementChild as NgElement;

  if (typeof options.withProperties !== 'function') {
    return;
  }

  const properties = await options.withProperties(options.ngModuleRef!);

  for (const [property, value] of Object.entries(properties)) {
    options.element[property] = value;
  }
}

function unmount(options: BootstrappedSingleSpaAngularElementsOptions): Promise<void> {
  return Promise.resolve().then(() => {
    // Removing custom element from DOM is enough since it will trigger
    // `disconnectedCallback()` and Angular will dispose all resources.
    options.element!.parentElement!.removeChild(options.element!);
    options.element = null;
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
