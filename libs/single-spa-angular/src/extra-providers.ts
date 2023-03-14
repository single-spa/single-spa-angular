import { Injectable, StaticProvider, Inject } from '@angular/core';
import {
  BrowserPlatformLocation,
  PlatformLocation,
  LocationChangeEvent,
  LocationChangeListener,
  DOCUMENT,
} from '@angular/common';

declare const Zone: any;

@Injectable()
export class SingleSpaPlatformLocation extends BrowserPlatformLocation {
  // This is a simple marker that helps us to ignore PopStateEvents
  // that was not dispatched by the browser.
  private skipNextPopState = false;

  private readonly source = 'Window.addEventListener:popstate';

  pushState(state: any, title: string, url: string): void {
    this.skipNextPopState = true;
    super.pushState(state, title, url);
  }

  replaceState(state: any, title: string, url: string): void {
    this.skipNextPopState = true;
    super.replaceState(state, title, url);
  }

  onPopState(fn: LocationChangeListener): VoidFunction {
    // `Zone.current` will reference the zone that serves as an execution context
    // to some specific application, especially when `onPopState` is called.
    const zone = Zone.current;

    // Wrap any event listener into zone that is specific to some application.
    // The main issue is `back/forward` buttons of browsers, because they invoke
    // `history.back|forward` which dispatch `popstate` event. Since `single-spa`
    // overrides `history.replaceState` Angular's zone cannot intercept this event.
    // Only the root zone is able to intercept all events.
    // See https://github.com/single-spa/single-spa-angular/issues/94 for more details
    fn = zone.wrap(fn, this.source);

    const onPopStateListener = (event: LocationChangeEvent) => {
      // The `LocationChangeEvent` doesn't have the `singleSpa` property, since it's added
      // by `single-spa` starting from `5.4` version. We need this check because we want
      // to skip "unnatural" PopStateEvents, the one caused by `single-spa`.
      const popStateEventWasDispatchedBySingleSpa = !!(event as unknown as { singleSpa: boolean })
        .singleSpa;

      if (this.skipNextPopState && popStateEventWasDispatchedBySingleSpa) {
        this.skipNextPopState = false;
      } else {
        fn(event);
      }
    };

    return super.onPopState(onPopStateListener);
  }
}

/**
 * The `PlatformLocation` class is an "injectee" of the `PathLocationStrategy`,
 * which creates `Subject` internally for listening on `popstate` events. We want
 * to provide this class in the most top injector that's used during bootstrapping.
 */
export function getSingleSpaExtraProviders(): StaticProvider[] {
  return [
    {
      provide: SingleSpaPlatformLocation,
      deps: [[new Inject(DOCUMENT)]],
    },
    {
      provide: PlatformLocation,
      useExisting: SingleSpaPlatformLocation,
    },
  ];
}
