import type { ApplicationRef, NgModuleRef, NgZone } from '@angular/core';
import type { LifeCycles } from 'single-spa';
import { getContainerElementAndSetTemplate } from '@single-spa-community/angular/internals';

import { SingleSpaPlatformLocation } from './platform-providers';
import type { SingleSpaAngularOptions, BootstrappedSingleSpaAngularOptions } from './types';

const defaultOptions = {
  // Required options that will be set by the library consumer.
  NgZone: null!,
  bootstrapFunction: null!,
  template: null!,
  // Optional options
  Router: undefined,
  domElementGetter: undefined, // only optional if you provide a domElementGetter as a custom prop
  updateFunction: () => Promise.resolve(),
  bootstrappedRef: null,
};

export function singleSpaAngular<T>(userOptions: SingleSpaAngularOptions<T>): LifeCycles<T> {
  if (typeof userOptions !== 'object') {
    throw Error('single-spa-angular requires a configuration object');
  }

  const options: SingleSpaAngularOptions = {
    ...defaultOptions,
    ...userOptions,
  };

  if (typeof options.bootstrapFunction !== 'function') {
    throw Error('single-spa-angular must be passed an options.bootstrapFunction');
  }

  if (typeof options.template !== 'string') {
    throw Error('single-spa-angular must be passed options.template string');
  }

  if (!options.NgZone) {
    throw Error(`single-spa-angular must be passed the NgZone option`);
  }

  if (options.Router && !options.NavigationStart) {
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

async function bootstrap(options: BootstrappedSingleSpaAngularOptions): Promise<void> {
  if (options.NgZone === 'noop') {
    return;
  }

  // `NgZone.assertInAngularZone` and `NgZone.assertNotInAngularZone` are static methods,
  // meaning they are shared across all instances of `NgZone`. When multiple Angular apps
  // share dependencies (i.e. the same `NgZone` class reference), these assertions become
  // unreliable because they cannot distinguish which application's zone is currently active.
  // For example, app A's zone could be active while app B's assertion fires, causing false
  // negatives. To avoid misleading errors in a microfrontend environment where multiple
  // Angular zones coexist on the same page, we replace both methods with no-ops.
  options.NgZone.assertInAngularZone = () => {};
  options.NgZone.assertNotInAngularZone = () => {};

  // single-spa intercepts browser navigation events (pushState, replaceState, popstate)
  // and orchestrates routing across all mounted microfrontends. However, Zone.js is unaware
  // of these navigation changes because they happen outside Angular's zone — single-spa
  // dispatches its own routing events rather than going through Angular's router lifecycle.
  // As a result, Angular's change detection is never triggered after a single-spa navigation.
  // To fix this, we register a routing event listener that explicitly re-enters the app's
  // Angular zone via `NgZone.run()`, which signals to Angular that something has changed
  // and change detection should run.
  // See https://github.com/single-spa/single-spa-angular/issues/86
  options.routingEventListener = () => {
    options.bootstrappedNgZone!.run(() => {});
  };
}

async function mount(
  options: SingleSpaAngularOptions,
  props: any,
): Promise<NgModuleRef<any> | ApplicationRef> {
  getContainerElementAndSetTemplate(options, props);

  const bootstrapPromise = options.bootstrapFunction(props);

  if (!(bootstrapPromise instanceof Promise)) {
    throw Error(
      `single-spa-angular: the options.bootstrapFunction must return a promise, but instead returned a '${typeof bootstrapPromise}' that is not a Promise`,
    );
  }

  const bootstrappedRef = await bootstrapPromise;

  if (typeof bootstrappedRef?.destroy !== 'function') {
    throw Error(
      `single-spa-angular: the options.bootstrapFunction returned a promise that did not resolve with a valid Angular module or ApplicationRef. Did you call platformBrowserDynamic().bootstrapModule() correctly?`,
    );
  }

  const singleSpaPlatformLocation = bootstrappedRef.injector.get(SingleSpaPlatformLocation, null);

  // `provideSingleSpaPlatform()` must be passed to `platformBrowser()` when the application
  // uses Angular's router. It registers `SingleSpaPlatformLocation` which overrides
  // `BrowserPlatformLocation` to handle popstate events correctly in a microfrontend environment.
  // Without it, Angular's router and single-spa will conflict when handling browser navigation,
  // leading to infinite loops or incorrect routing behavior.
  //
  // However, if the app is running in zoneless mode (`NgZone: 'noop'`), change detection is
  // managed manually and the platform location override is not needed, so we skip this check.
  //
  // If the user provided a `Router` but `SingleSpaPlatformLocation` is not present in the
  // platform injector, it means `provideSingleSpaPlatform()` was not passed to `platformBrowser()`
  // and we throw a descriptive error to guide them toward the fix.
  if (options.Router && singleSpaPlatformLocation === null) {
    throw new Error(`
    single-spa-angular: could not retrieve extra providers from the platform injector. Did you add provideSingleSpaPlatform()?
  `);
  }

  const bootstrappedOptions = options as BootstrappedSingleSpaAngularOptions;

  if (options.NgZone !== 'noop') {
    const ngZone: NgZone = bootstrappedRef.injector.get(options.NgZone);

    // The app may use `NgZone` but not Angular's router (e.g. a microfrontend that manages
    // its own navigation or has no routing at all). In that case, `provideSingleSpaPlatform()`
    // would not have been called and `SingleSpaPlatformLocation` would not be registered in
    // the platform injector. We only wire up the popstate skip logic when we can confirm
    // that `SingleSpaPlatformLocation` is present, since `skipLocationChangeOnNonImperativeRoutingTriggers`
    // relies on it to distinguish synthetic single-spa navigation events from genuine
    // browser back/forward navigation.
    if (singleSpaPlatformLocation !== null) {
      skipLocationChangeOnNonImperativeRoutingTriggers(bootstrappedRef, options);
    }

    bootstrappedOptions.bootstrappedNgZone = ngZone;
    window.addEventListener('single-spa:routing-event', bootstrappedOptions.routingEventListener!);
  }

  bootstrappedOptions.bootstrappedRef = bootstrappedRef;
  return bootstrappedRef;
}

function unmount(options: BootstrappedSingleSpaAngularOptions): Promise<void> {
  return Promise.resolve().then(() => {
    if (options.routingEventListener) {
      window.removeEventListener('single-spa:routing-event', options.routingEventListener);
    }

    options.bootstrappedRef!.destroy();
    options.bootstrappedRef = null;
  });
}

function skipLocationChangeOnNonImperativeRoutingTriggers(
  bootstrappedRef: NgModuleRef<any> | ApplicationRef,
  options: SingleSpaAngularOptions,
): void {
  const { NavigationStart, Router } = options;
  if (!NavigationStart || !Router) {
    // `NavigationStart` and `Router` must both be provided in `singleSpaAngular()` options
    // for this optimization to work. We intentionally do nothing if they are absent rather
    // than throwing, because adding this as a hard requirement would be a breaking change
    // for existing users who haven't provided these options.
    return;
  }

  const router = bootstrappedRef.injector.get(Router);
  const subscription = router.events.subscribe((event: any) => {
    if (event instanceof NavigationStart) {
      const currentNavigation = router.getCurrentNavigation();

      // In a single-spa microfrontend environment, multiple apps share the same browser URL.
      // When single-spa triggers a routing change (e.g. via popstate or its own navigation
      // events), Angular's router responds and would normally call `setBrowserUrl()` internally,
      // which calls `history.replaceState()` and dispatches a new `popstate` event. This creates
      // a feedback loop: single-spa triggers Angular, Angular updates the URL, which triggers
      // single-spa again, and so on.
      //
      // To break this cycle, we intercept every non-imperative navigation (i.e. navigations
      // triggered by popstate or single-spa routing events, rather than by explicit router.navigate()
      // calls in application code) and set `skipLocationChange: true`. This tells Angular's router
      // to perform the navigation and update its internal state without calling `history.replaceState()`,
      // preventing the redundant popstate event that would otherwise cause the infinite loop.
      //
      // `replaceUrl: false` is also set to ensure Angular does not attempt to replace the current
      // history entry, which would have the same undesirable side effect.
      if (currentNavigation.trigger !== 'imperative') {
        currentNavigation.extras.skipLocationChange = true;
        currentNavigation.extras.replaceUrl = false;
      }
    }
  });

  bootstrappedRef.onDestroy(() => subscription.unsubscribe());
}
