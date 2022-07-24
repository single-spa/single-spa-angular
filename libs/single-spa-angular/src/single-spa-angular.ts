import { ApplicationRef, NgModuleRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { LifeCycles } from 'single-spa';
import { getContainerElementAndSetTemplate } from 'single-spa-angular/internals';

import { SingleSpaPlatformLocation } from './extra-providers';
import { SingleSpaAngularOptions, BootstrappedSingleSpaAngularOptions } from './types';

const defaultOptions = {
  // Required options that will be set by the library consumer.
  NgZone: null!,
  bootstrapFunction: null!,
  template: null!,
  // Optional options
  Router: undefined,
  domElementGetter: undefined, // only optional if you provide a domElementGetter as a custom prop
  updateFunction: () => Promise.resolve(),
  bootstrappedNgModuleRefOrAppRef: null,
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

  if (NG_DEV_MODE && typeof options.template !== 'string') {
    throw Error('single-spa-angular must be passed options.template string');
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
  // Angular provides an opportunity to develop `zone-less` application, where developers
  // have to trigger change detection manually.
  // See https://angular.io/guide/zone#noopzone
  if (options.NgZone === 'noop') {
    return;
  }

  // In order for multiple Angular apps to work concurrently on a page, they each need a unique identifier.
  options.zoneIdentifier = `single-spa-angular:${props.name || props.appName}`;

  // This is a hack, since NgZone doesn't allow you to configure the property that identifies your zone.
  // See https://github.com/PlaceMe-SAS/single-spa-angular-cli/issues/33,
  // https://github.com/single-spa/single-spa-angular/issues/47,
  // https://github.com/angular/angular/blob/a14dc2d7a4821a19f20a9547053a5734798f541e/packages/core/src/zone/ng_zone.ts#L144,
  // and https://github.com/angular/angular/blob/a14dc2d7a4821a19f20a9547053a5734798f541e/packages/core/src/zone/ng_zone.ts#L257
  options.NgZone.isInAngularZone = () => {
    // @ts-ignore
    return window.Zone.current._properties[options.zoneIdentifier] === true;
  };

  options.routingEventListener = () => {
    options.bootstrappedNgZone!.run(() => {
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

  if (ngZoneEnabled) {
    const ngZone: NgZone = ngModuleRefOrAppRef.injector.get(options.NgZone);
    const zoneIdentifier: string = bootstrappedOptions.zoneIdentifier!;

    // `NgZone` can be enabled but routing may not be used thus `getSingleSpaExtraProviders()`
    // function was not called.
    if (singleSpaPlatformLocation !== null) {
      skipLocationChangeOnNonImperativeRoutingTriggers(ngModuleRefOrAppRef, options);
    }

    bootstrappedOptions.bootstrappedNgZone = ngZone;
    bootstrappedOptions.bootstrappedNgZone['_inner']._properties[zoneIdentifier] = true;
    window.addEventListener('single-spa:routing-event', bootstrappedOptions.routingEventListener!);
  }

  bootstrappedOptions.bootstrappedNgModuleRefOrAppRef = ngModuleRefOrAppRef;
  return ngModuleRefOrAppRef;
}

function unmount(options: BootstrappedSingleSpaAngularOptions): Promise<void> {
  return Promise.resolve().then(() => {
    if (options.routingEventListener) {
      window.removeEventListener('single-spa:routing-event', options.routingEventListener);
    }

    options.bootstrappedNgModuleRefOrAppRef!.destroy();
    options.bootstrappedNgModuleRefOrAppRef = null;
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

  // The `ApplicationRef` also has `onDestroy` method, but it's marked as internal.
  ngModuleRefOrAppRef['onDestroy'](() => {
    subscription.unsubscribe();
  });
}
