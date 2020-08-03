import { Injectable, NgZone, StaticProvider, Inject } from '@angular/core';
import {
  ɵBrowserPlatformLocation,
  PlatformLocation,
  LocationChangeEvent,
  DOCUMENT,
} from '@angular/common';

@Injectable()
export class SingleSpaPlatformLocation extends ɵBrowserPlatformLocation {
  private ngZone!: NgZone;

  // This is a simple marker that helps us to ignore PopStateEvents
  // that was not dispatched by the browser.
  private skipNextPopState = 0;

  private onPopStateListeners: ((event: LocationChangeEvent) => void)[] = [];

  destroy(): void {
    // TLDR: Angular adds `popstate` event listener and then doesn't remove it when application gets destroyed.
    // Basically, Angular has a potentional memory leak. The `ɵBrowserPlatformLocation`
    // has `onPopState` method which adds `popstate` event listener and forgets, see here:
    // https://github.com/angular/angular/blob/14be55c9facf3e47b8c97df4502dc3f0f897da03/packages/common/src/location/platform_location.ts#L126

    for (const onPopStateListener of this.onPopStateListeners) {
      window.removeEventListener('popstate', onPopStateListener);
    }

    // We do this because the `SingleSpaPlatformLocation` is a part of PLATFORM_INJECTOR,
    // which means it's created only once and will not be garbage collected, since the PLATFORM_INJECTOR
    // will keep reference to its instance.
    // TODO: https://github.com/single-spa/single-spa-angular/issues/170
    this.onPopStateListeners = [];
  }

  pushState(state: any, title: string, url: string): void {
    this.skipNextPopState++;
    super.pushState(state, title, url);
  }

  replaceState(state: any, title: string, url: string): void {
    this.skipNextPopState++;
    super.replaceState(state, title, url);
  }

  onPopState(fn: (event: LocationChangeEvent) => void): void {
    const onPopStateListener = (event: LocationChangeEvent) => {
      // The `LocationChangeEvent` doesn't have the `singleSpa` property, since it's added
      // by `single-spa` starting from `5.4` version. We need this check because we want
      // to skip "unnatural" PopStateEvents, the one caused by `single-spa`.
      const popStateEventWasDispatchedBySingleSpa = !!((event as unknown) as { singleSpa: boolean })
        .singleSpa;

      if (this.skipNextPopState && popStateEventWasDispatchedBySingleSpa) {
        this.skipNextPopState++;
      } else if (this.skipNextPopState === 0) {
        // Wrap any event listener into zone that is specific to some application.
        // The main issue is `back/forward` buttons of browsers, because they invoke
        // `history.back|forward` which dispatch `popstate` event. Since `single-spa`
        // overrides `history.replaceState` Angular's zone cannot intercept this event.
        // Only the root zone is able to intercept all events.
        // See https://github.com/single-spa/single-spa-angular/issues/94 for more details
        this.ngZone.run(() => fn(event));
      }
    };

    // All listeners should be stored inside an array because the `onPopState` can be called
    // multiple times thus we wanna reference all listeners to remove them further.
    this.onPopStateListeners.push(onPopStateListener);
    super.onPopState(onPopStateListener);
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
