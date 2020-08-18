import { Injectable, StaticProvider, Inject } from '@angular/core';
import {
  ɵBrowserPlatformLocation,
  PlatformLocation,
  LocationChangeEvent,
  DOCUMENT,
} from '@angular/common';

type OnPopStateListener = (event: LocationChangeEvent) => void;

declare const Zone: any;

@Injectable()
export class SingleSpaPlatformLocation extends ɵBrowserPlatformLocation {
  // This is a simple marker that helps us to ignore PopStateEvents
  // that was not dispatched by the browser.
  private skipNextPopState = false;

  // The key here is an actual forked `Zone` of some specific application.
  // We will be able to find the specific zone when application gets destroyed
  // by application `name`.
  private zoneToOnPopStateListenersMap = new Map<any, OnPopStateListener[]>();

  // This is used only to make `Zone.wrap` happy, since it requires 2 arguments
  // and the second argument is a unique string which `zone.js` uses for debugging purposes.
  // We might want to use the application name, but we're not able to get it when `onPopState`
  // method is called during module bootstrapping.
  private source = 0;

  destroyApplication(zoneIdentifier: string): void {
    // TLDR: Angular adds `popstate` event listener and then doesn't remove it when application gets destroyed.
    // Basically, Angular has a potentional memory leak. The `ɵBrowserPlatformLocation`
    // has `onPopState` method which adds `popstate` event listener and forgets, see here:
    // https://github.com/angular/angular/blob/14be55c9facf3e47b8c97df4502dc3f0f897da03/packages/common/src/location/platform_location.ts#L126
    const zone = [...this.zoneToOnPopStateListenersMap.keys()].find(
      // `getZoneWith` will return a zone which defines a `key` and in our case
      // we define a custom key in `single-spa-angular.ts`
      // via this line of code:
      // `_properties[zoneIdentifier] = true;`
      zone => zone.getZoneWith(zoneIdentifier) !== null,
    );

    const onPopStateListeners:
      | OnPopStateListener[]
      | undefined = this.zoneToOnPopStateListenersMap.get(zone);

    if (Array.isArray(onPopStateListeners)) {
      for (const onPopStateListener of onPopStateListeners) {
        window.removeEventListener('popstate', onPopStateListener);
      }
    }

    this.zoneToOnPopStateListenersMap.delete(zone);
  }

  pushState(state: any, title: string, url: string): void {
    this.skipNextPopState = true;
    super.pushState(state, title, url);
  }

  replaceState(state: any, title: string, url: string): void {
    this.skipNextPopState = true;
    super.replaceState(state, title, url);
  }

  onPopState(fn: OnPopStateListener): void {
    // `Zone.current` will reference the zone that serves as an execution context
    // to some specific application, especially when `onPopState` is called.
    const zone = Zone.current;

    // Wrap any event listener into zone that is specific to some application.
    // The main issue is `back/forward` buttons of browsers, because they invoke
    // `history.back|forward` which dispatch `popstate` event. Since `single-spa`
    // overrides `history.replaceState` Angular's zone cannot intercept this event.
    // Only the root zone is able to intercept all events.
    // See https://github.com/single-spa/single-spa-angular/issues/94 for more details
    fn = zone.wrap(fn, `${this.source++}`);

    const onPopStateListener = (event: LocationChangeEvent) => {
      // The `LocationChangeEvent` doesn't have the `singleSpa` property, since it's added
      // by `single-spa` starting from `5.4` version. We need this check because we want
      // to skip "unnatural" PopStateEvents, the one caused by `single-spa`.
      const popStateEventWasDispatchedBySingleSpa = !!((event as unknown) as { singleSpa: boolean })
        .singleSpa;

      if (this.skipNextPopState && popStateEventWasDispatchedBySingleSpa) {
        this.skipNextPopState = false;
      } else {
        fn(event);
      }
    };

    this.storeOnPopStateListener(zone, onPopStateListener);
    super.onPopState(onPopStateListener);
  }

  private storeOnPopStateListener(zone: any, onPopStateListener: OnPopStateListener): void {
    // All listeners should be stored inside an array because the `onPopState` can be called
    // multiple times thus we wanna reference all listeners to remove them further.
    const onPopStateListeners: OnPopStateListener[] =
      this.zoneToOnPopStateListenersMap.get(zone) || [];

    onPopStateListeners.push(onPopStateListener);

    if (!this.zoneToOnPopStateListenersMap.has(zone)) {
      this.zoneToOnPopStateListenersMap.set(zone, onPopStateListeners);
    }
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
