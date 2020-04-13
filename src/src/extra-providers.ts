import { Injectable, NgZone, StaticProvider, Inject } from '@angular/core';
import {
  ɵBrowserPlatformLocation,
  PlatformLocation,
  LocationChangeEvent,
  DOCUMENT,
} from '@angular/common';

@Injectable()
export class SingleSpaPlatformLocation extends ɵBrowserPlatformLocation {
  /**
   * We could use the `inject` function from `@angular/core` which resolves
   * dependencies from the currently active injector, but it's a feature
   * of Angular 8+. Should be used when we drop support for older versions.
   */
  private ngZone!: NgZone;

  onPopState(fn: (event: LocationChangeEvent) => void): void {
    super.onPopState(event => {
      // Wrap any event listener into zone that is specific to some application.
      // The main issue is `back/forward` buttons of browsers, because they invoke
      // `history.back|forward` which dispatch `popstate` event. Since `single-spa`
      // overrides `history.replaceState` Angular's zone cannot intercept this event.
      // Only the root zone is able to intercept all events.
      // See https://github.com/single-spa/single-spa-angular/issues/94 for more detail
      this.ngZone.run(() => fn(event));
    });
  }

  setNgZone(ngZone: NgZone): void {
    this.ngZone = ngZone;
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
      useClass: SingleSpaPlatformLocation,
      deps: [[new Inject(DOCUMENT)]],
    },
    {
      provide: PlatformLocation,
      useExisting: SingleSpaPlatformLocation,
    },
  ];
}
