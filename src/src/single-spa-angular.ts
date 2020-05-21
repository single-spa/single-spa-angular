import { NgModuleRef } from '@angular/core';
import { LifeCycles } from 'single-spa';
import {
  getContainerEl,
  chooseDomElementGetter,
  removeApplicationFromDOMIfIvyEnabled,
  SingleSpaAngularOpts,
  BootstrappedSingleSpaAngularOpts,
} from 'single-spa-angular/internals';

import { SingleSpaPlatformLocation } from './extra-providers';

const defaultOpts = {
  // Required opts that will be set by the library consumer.
  NgZone: null!,
  bootstrapFunction: null!,
  template: null!,
  // optional opts
  Router: undefined,
  domElementGetter: undefined, // only optional if you provide a domElementGetter as a custom prop
  AnimationEngine: undefined,
  updateFunction: () => Promise.resolve(),
};

export function singleSpaAngular(userOpts: SingleSpaAngularOpts): LifeCycles {
  if (typeof userOpts !== 'object') {
    throw Error('single-spa-angular requires a configuration object');
  }

  const opts: SingleSpaAngularOpts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (typeof opts.bootstrapFunction !== 'function') {
    throw Error('single-spa-angular must be passed an opts.bootstrapFunction');
  }

  if (typeof opts.template !== 'string') {
    throw Error('single-spa-angular must be passed opts.template string');
  }

  if (!opts.NgZone) {
    throw Error(`single-spa-angular must be passed the NgZone opt`);
  }

  return {
    bootstrap: bootstrap.bind(null, opts as BootstrappedSingleSpaAngularOpts),
    mount: mount.bind(null, opts),
    unmount: unmount.bind(null, opts as BootstrappedSingleSpaAngularOpts),
    update: opts.updateFunction,
  };
}

async function bootstrap(opts: BootstrappedSingleSpaAngularOpts, props: any): Promise<void> {
  // Angular provides an opportunity to develop `zone-less` application, where developers
  // have to trigger change detection manually.
  // See https://angular.io/guide/zone#noopzone
  if (opts.NgZone === 'noop') {
    return;
  }

  // In order for multiple Angular apps to work concurrently on a page, they each need a unique identifier.
  opts.zoneIdentifier = `single-spa-angular:${props.name || props.appName}`;

  // This is a hack, since NgZone doesn't allow you to configure the property that identifies your zone.
  // See https://github.com/PlaceMe-SAS/single-spa-angular-cli/issues/33,
  // https://github.com/single-spa/single-spa-angular/issues/47,
  // https://github.com/angular/angular/blob/a14dc2d7a4821a19f20a9547053a5734798f541e/packages/core/src/zone/ng_zone.ts#L144,
  // and https://github.com/angular/angular/blob/a14dc2d7a4821a19f20a9547053a5734798f541e/packages/core/src/zone/ng_zone.ts#L257
  opts.NgZone.isInAngularZone = function () {
    // @ts-ignore
    return window.Zone.current._properties[opts.zoneIdentifier] === true;
  };

  opts.routingEventListener = () => {
    opts.bootstrappedNgZone!.run(() => {
      // See https://github.com/single-spa/single-spa-angular/issues/86
      // Zone is unaware of the single-spa navigation change and so Angular change detection doesn't work
      // unless we tell Zone that something happened
    });
  };
}

async function mount(opts: SingleSpaAngularOpts, props: any): Promise<NgModuleRef<any>> {
  const domElementGetter = chooseDomElementGetter(opts, props);

  if (!domElementGetter) {
    throw Error(
      `cannot mount angular application '${
        props.name || props.appName
      }' without a domElementGetter provided either as an opt or a prop`,
    );
  }

  const containerEl = getContainerEl(domElementGetter);
  containerEl.innerHTML = opts.template;
  const bootstrapPromise = opts.bootstrapFunction(props);

  if (!(bootstrapPromise instanceof Promise)) {
    throw Error(
      `single-spa-angular: the opts.bootstrapFunction must return a promise, but instead returned a '${typeof bootstrapPromise}' that is not a Promise`,
    );
  }

  const module: NgModuleRef<any> = await bootstrapPromise;

  if (!module || typeof module.destroy !== 'function') {
    throw Error(
      `single-spa-angular: the opts.bootstrapFunction returned a promise that did not resolve with a valid Angular module. Did you call platformBrowser().bootstrapModuleFactory() correctly?`,
    );
  }

  const singleSpaPlatformLocation: SingleSpaPlatformLocation | null = module.injector.get(
    SingleSpaPlatformLocation,
    null,
  );

  const ngZoneEnabled = opts.NgZone !== 'noop';

  // The user has to provide `BrowserPlatformLocation` only if his application uses routing.
  // So if he provided `Router` but didn't provide `BrowserPlatformLocation` then we have to inform him.
  // Also `getSingleSpaExtraProviders()` function should be called only if the user doesn't use
  // `zone-less` change detection, if `NgZone` is `noop` then we can skip it.
  if (ngZoneEnabled && opts.Router && singleSpaPlatformLocation === null) {
    throw new Error(`	
      single-spa-angular: could not retrieve extra providers from the platform injector. Did you call getSingleSpaExtraProviders() when creating platform?	
    `);
  }

  const bootstrappedOpts = opts as BootstrappedSingleSpaAngularOpts;

  if (ngZoneEnabled) {
    const ngZone: import('@angular/core').NgZone = module.injector.get(opts.NgZone);

    // `NgZone` can be enabled but routing may not be used thus `getSingleSpaExtraProviders()`
    // function was not called.
    if (singleSpaPlatformLocation !== null) {
      singleSpaPlatformLocation.setNgZone(ngZone);
      // Cleanup resources, especially remove event listeners thus they will not be added
      // twice when application gets bootstrapped the second time.
      module.onDestroy(() => singleSpaPlatformLocation.destroy());
    }

    bootstrappedOpts.bootstrappedNgZone = ngZone;
    bootstrappedOpts.bootstrappedNgZone['_inner']._properties[
      bootstrappedOpts.zoneIdentifier
    ] = true;
    window.addEventListener('single-spa:routing-event', bootstrappedOpts.routingEventListener!);
  }

  bootstrappedOpts.bootstrappedModule = module;
  return module;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function unmount(opts: BootstrappedSingleSpaAngularOpts, props: any): Promise<void> {
  if (opts.Router) {
    // Workaround for https://github.com/angular/angular/issues/19079
    const router = opts.bootstrappedModule.injector.get(opts.Router);
    router.dispose();
  }

  if (opts.routingEventListener) {
    window.removeEventListener('single-spa:routing-event', opts.routingEventListener);
  }

  if (opts.AnimationEngine) {
    /*
    The BrowserAnimationsModule does not clean up after itself :'(. When you unmount/destroy the main module, the
    BrowserAnimationsModule uses an AnimationRenderer thing to remove dom elements from the page. But the AnimationRenderer
    defers the actual work to the TransitionAnimationEngine to do this, and the TransitionAnimationEngine doesn't actually
    remove the dom node, but just calls "markElementAsRemoved()".

    See https://github.com/angular/angular/blob/db62ccf9eb46ee89366ade586365ea027bb93eb1/packages/animations/browser/src/render/transition_animation_engine.ts#L717

    What markAsRemovedDoes is put it into an array called "collectedLeaveElements", which is all the elements that should be removed
    after the DOM has had a chance to do any animations.

    See https://github.com/angular/angular/blob/master/packages/animations/browser/src/render/transition_animation_engine.ts#L525

    The actual dom nodes aren't removed until the TransitionAnimationEngine "flushes".

    See https://github.com/angular/angular/blob/db62ccf9eb46ee89366ade586365ea027bb93eb1/packages/animations/browser/src/render/transition_animation_engine.ts#L851

    Unfortunately, though, that "flush" will never happen, since the entire module is being destroyed and there will be no more flushes.
    So what we do in this code is force one more flush of the animations after the module is destroyed.

    Ideally, we would do this by getting the TransitionAnimationEngine directly and flushing it. Unfortunately, though, it's private class
    that cannot be imported and is not provided to the dependency injector. So, instead, we get its wrapper class, AnimationEngine, and then
    access its private variable reference to the TransitionAnimationEngine so that we can call flush.
    */
    const animationEngine = opts.bootstrappedModule.injector.get(opts.AnimationEngine);
    animationEngine._transitionEngine.flush();
  }

  opts.bootstrappedModule.destroy();
  delete opts.bootstrappedModule;

  // This is an issue. Issue has been created and Angular team is working on the fix:
  // https://github.com/angular/angular/issues/36449
  removeApplicationFromDOMIfIvyEnabled(opts, props);
}
