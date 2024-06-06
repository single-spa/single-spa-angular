import { ApplicationRef, NgModuleRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { LifeCycles } from 'single-spa';
import { getContainerElementAndSetTemplate } from 'single-spa-angular/internals';

import { SingleSpaPlatformLocation } from './extra-providers';
import { SingleSpaAngularOptions, BootstrappedSingleSpaAngularOptions, Instance } from './types';

const defaultOptions = {
  // Required options that will be set by the library consumer.
  NgZone: null!,
  bootstrapFunction: null!,
  template: null!,
  // Optional options
  Router: undefined,
  domElementGetter: undefined, // only optional if you provide a domElementGetter as a custom prop
  updateFunction: () => Promise.resolve(),
  instances: {},
};

// This will be provided through Terser global definitions by Angular CLI. This will
// help to tree-shake away the code unneeded for production bundles.
declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export function singleSpaAngular<T>(userOptions: SingleSpaAngularOptions<T>): LifeCycles<T> {
  if (NG_DEV_MODE && typeof userOptions !== 'object') {
    throw Error('single-spa-angular requires a configuration object');
  }

  const options: SingleSpaAngularOptions = {
    ...defaultOptions,
    ...userOptions,
  };

  if (NG_DEV_MODE && typeof options.bootstrapFunction !== 'function') {
    throw Error('single-spa-angular must be passed an options.bootstrapFunction');
  }

  if (
    NG_DEV_MODE &&
    typeof options.template !== 'string' &&
    typeof options.template !== 'function'
  ) {
    throw Error('single-spa-angular must be passed an options.template string or function');
  }

  if (NG_DEV_MODE && !options.NgZone) {
    throw Error(`single-spa-angular must be passed the NgZone option`);
  }

  if (NG_DEV_MODE && options.Router && !options.NavigationStart) {
    // We call `console.warn` except of throwing `new Error()` since this will not
    // be a breaking change.
    console.warn(`single-spa-angular must be passed the NavigationStart option`);
  }

  return {
    bootstrap: bootstrap.bind(null, options as BootstrappedSingleSpaAngularOptions),
    mount: mount.bind(null, options),
    unmount: unmount.bind(null, options as BootstrappedSingleSpaAngularOptions),
    update: options.updateFunction,
  };
}

async function bootstrap(options: BootstrappedSingleSpaAngularOptions, props: any): Promise<void> {
  const instance: Instance = {
    bootstrappedNgModuleRefOrAppRef: null,
  };
  options.instances[props.name || props.appName] = instance;

  // Angular provides an opportunity to develop `zone-less` application, where developers
  // have to trigger change detection manually.
  // See https://angular.io/guide/zone#noopzone
  if (options.NgZone === 'noop') {
    return;
  }

  // Note that we have to make it a noop function because it's a static property and not
  // an instance property. We're unable to configure it for multiple apps when dependencies
  // are shared and reference the same `NgZone` class. We can't determine where this function
  // is being executed or under which application, making it difficult to assert whether this
  // app is running under its zone.
  options.NgZone.assertInAngularZone = () => {};
  options.NgZone.assertNotInAngularZone = () => {};

  instance.routingEventListener = () => {
    instance.bootstrappedNgZone!.run(() => {
      // See https://github.com/single-spa/single-spa-angular/issues/86
      // Zone is unaware of the single-spa navigation change and so Angular change detection doesn't work
      // unless we tell Zone that something happened
    });
  };
}

async function mount(
  options: SingleSpaAngularOptions,
  props: any,
): Promise<NgModuleRef<any> | ApplicationRef> {
  getContainerElementAndSetTemplate(options, props);

  const bootstrapPromise = options.bootstrapFunction(props);

  if (NG_DEV_MODE && !(bootstrapPromise instanceof Promise)) {
    throw Error(
      `single-spa-angular: the options.bootstrapFunction must return a promise, but instead returned a '${typeof bootstrapPromise}' that is not a Promise`,
    );
  }

  const ngModuleRefOrAppRef: NgModuleRef<any> | ApplicationRef = await bootstrapPromise;

  if (NG_DEV_MODE) {
    if (!ngModuleRefOrAppRef || typeof ngModuleRefOrAppRef.destroy !== 'function') {
      throw Error(
        `single-spa-angular: the options.bootstrapFunction returned a promise that did not resolve with a valid Angular module or ApplicationRef. Did you call platformBrowserDynamic().bootstrapModule() correctly?`,
      );
    }
  }

  const singleSpaPlatformLocation: SingleSpaPlatformLocation | null =
    ngModuleRefOrAppRef.injector.get(SingleSpaPlatformLocation, null);

  const ngZoneEnabled = options.NgZone !== 'noop';

  // The user has to provide `BrowserPlatformLocation` only if his application uses routing.
  // So if he provided `Router` but didn't provide `BrowserPlatformLocation` then we have to inform him.
  // Also `getSingleSpaExtraProviders()` function should be called only if the user doesn't use
  // `zone-less` change detection, if `NgZone` is `noop` then we can skip it.
  if (NG_DEV_MODE && ngZoneEnabled && options.Router && singleSpaPlatformLocation === null) {
    throw new Error(`
      single-spa-angular: could not retrieve extra providers from the platform injector. Did you call platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule()?
    `);
  }

  const bootstrappedOptions = options as BootstrappedSingleSpaAngularOptions;

  const instance = bootstrappedOptions.instances[props.name || props.appName];

  if (ngZoneEnabled) {
    const ngZone: NgZone = ngModuleRefOrAppRef.injector.get(options.NgZone);

    // `NgZone` can be enabled but routing may not be used thus `getSingleSpaExtraProviders()`
    // function was not called.
    if (singleSpaPlatformLocation !== null) {
      skipLocationChangeOnNonImperativeRoutingTriggers(ngModuleRefOrAppRef, options);
    }

    instance.bootstrappedNgZone = ngZone;
    window.addEventListener('single-spa:routing-event', instance.routingEventListener!);
  }

  instance.bootstrappedNgModuleRefOrAppRef = ngModuleRefOrAppRef;
  return ngModuleRefOrAppRef;
}

function unmount(options: BootstrappedSingleSpaAngularOptions, props: any): Promise<void> {
  const instance: Instance = options.instances[props.name || props.appName];

  return Promise.resolve().then(() => {
    if (instance.routingEventListener) {
      window.removeEventListener('single-spa:routing-event', instance.routingEventListener);
    }

    instance.bootstrappedNgModuleRefOrAppRef!.destroy();
    instance.bootstrappedNgModuleRefOrAppRef = null;

    // Delete instance from array of instances.
    // delete options.instances[props.name || props.appName];
  });
}

function skipLocationChangeOnNonImperativeRoutingTriggers(
  ngModuleRefOrAppRef: NgModuleRef<any> | ApplicationRef,
  options: SingleSpaAngularOptions,
): void {
  if (!options.NavigationStart) {
    // As discussed we don't do anything right now if the developer doesn't provide
    // `options.NavigationStart` since this might be a breaking change.
    return;
  }

  const router = ngModuleRefOrAppRef.injector.get(options.Router);
  const subscription: Subscription = router.events.subscribe((event: any) => {
    if (event instanceof options.NavigationStart!) {
      const currentNavigation = router.getCurrentNavigation();
      // This listener will be set up for each Angular application
      // that has routing capabilities.
      // We set `skipLocationChange` for each non-imperative navigation,
      // Angular router checks under the hood if it has to change
      // the browser URL or not.
      // If `skipLocationChange` is truthy then Angular router will not call
      // `setBrowserUrl()` which calls `history.replaceState()` and dispatches `popstate` event.
      if (currentNavigation.trigger !== 'imperative') {
        currentNavigation.extras.skipLocationChange = true;
        currentNavigation.extras.replaceUrl = false;
      }
    }
  });

  ngModuleRefOrAppRef.onDestroy(() => subscription.unsubscribe());
}
