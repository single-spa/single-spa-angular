import { Injectable, inject, NgZone, StaticProvider, Inject } from '@angular/core';
import {
  ɵBrowserPlatformLocation,
  PlatformLocation,
  LocationChangeEvent,
  DOCUMENT,
} from '@angular/common';

@Injectable()
class SingleSpaPlatformLocation extends ɵBrowserPlatformLocation {
  onPopState(fn: (event: LocationChangeEvent) => void): void {
    const ngZone = inject(NgZone);

    super.onPopState(event => {
      // Wrap any event listener into zone that is specific to some application.
      // The main issue is `back/forward` buttons of browsers, because they invoke
      // `history.back|forward` which dispatch `popstate` event. Since `single-spa`
      // overrides `history.replaceState` Angular's zone cannot intercept this event.
      // Only the root zone is able to intercept all events.
      // See https://github.com/single-spa/single-spa-angular/issues/94 for more detail
      ngZone.run(() => fn(event));
    });
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
      provide: PlatformLocation,
      useClass: SingleSpaPlatformLocation,
      deps: [[new Inject(DOCUMENT)]],
    },
  ];
}

// Providers have to be exported but we don't want our users to consume
// this class because it's meant to be private.
export { SingleSpaPlatformLocation as ɵSingleSpaPlatformLocation };
