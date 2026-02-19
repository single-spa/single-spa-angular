import { inject, PlatformRef, type StaticProvider } from '@angular/core';
import {
  BrowserPlatformLocation,
  PlatformLocation,
  type LocationChangeEvent,
  type LocationChangeListener,
} from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

declare const Zone: any;

function runOutsideAngular<T>(fn: () => T): T {
  return typeof Zone !== 'undefined' && typeof Zone?.root?.run === 'function'
    ? Zone.root.run(fn)
    : fn();
}

export class SingleSpaPlatformLocation extends BrowserPlatformLocation {
  // When `pushState` or `replaceState` is called, single-spa will dispatch a synthetic
  // `popstate` event to notify other apps of the URL change. We use this flag to
  // distinguish those synthetic events from genuine browser back/forward navigation,
  // so we can skip processing them and avoid triggering redundant Angular router updates.
  private skipNextPopState = false;

  private readonly source = 'Window.addEventListener:popstate';

  // A Subject that buffers [listener, event] pairs for processing.
  // Using a Subject here allows us to apply RxJS operators (switchMap + timer)
  // to debounce and defer popstate handling, which is critical for fast navigation.
  private readonly onPopState$ = new Subject<[LocationChangeListener, LocationChangeEvent]>();

  constructor() {
    super();

    const platform = inject(PlatformRef);

    // Clean up the Subject when the Angular platform is destroyed (e.g., app unmount in single-spa)
    // to prevent memory leaks and dangling subscriptions.
    platform.onDestroy(() => this.onPopState$.complete());

    this.onPopState$
      .pipe(
        // `switchMap` cancels any pending timer from a previous popstate event when a new one
        // arrives. This is the key to avoiding infinite loops and race conditions during fast
        // navigation: if the user navigates rapidly (e.g., hitting back/forward quickly),
        // only the most recent popstate event will be processed. Earlier ones are discarded.
        switchMap(
          state =>
            // setTimeout defers execution to the next macrotask.
            // This gives single-spa time to finish its own synchronous URL/state updates before
            // Angular's router reacts. Without this delay, Angular and single-spa could both
            // attempt to modify history state simultaneously, causing conflicts or infinite
            // navigation loops.
            new Observable<[LocationChangeListener, LocationChangeEvent]>(subscriber =>
              runOutsideAngular(() => {
                const timeoutId = setTimeout(() => {
                  subscriber.next(state);
                });
                return () => clearTimeout(timeoutId);
              }),
            ),
        ),
      )
      .subscribe(([fn, event]) => {
        // single-spa adds a `singleSpa` property to popstate events it dispatches itself
        // (introduced in single-spa v5.4). This lets us distinguish synthetic events
        // (triggered programmatically by single-spa) from genuine browser navigation events
        // (triggered by the user pressing back/forward).
        const popStateEventWasDispatchedBySingleSpa = !!(event as unknown as { singleSpa: boolean })
          .singleSpa;

        if (this.skipNextPopState && popStateEventWasDispatchedBySingleSpa) {
          // This popstate event was dispatched by single-spa in response to our own
          // `pushState`/`replaceState` call. Skip it to prevent Angular from processing
          // a navigation it already initiated, and reset the flag for the next event.
          this.skipNextPopState = false;
        } else {
          // This is either a genuine browser navigation event, or a single-spa event
          // that we did not initiate ourselves. Let Angular's router handle it normally.
          fn(event);
        }
      });
  }

  pushState(state: any, title: string, url: string): void {
    // Set the flag before calling the native pushState. single-spa listens to pushState
    // and will synchronously dispatch a synthetic popstate event in response. By setting
    // this flag first, we ensure that synthetic event gets ignored when it arrives.
    this.skipNextPopState = true;
    super.pushState(state, title, url);
  }

  replaceState(state: any, title: string, url: string): void {
    // Same reasoning as pushState above — set the flag before the native call
    // so the resulting synthetic popstate event from single-spa is skipped.
    this.skipNextPopState = true;
    super.replaceState(state, title, url);
  }

  onPopState(fn: LocationChangeListener): VoidFunction {
    // Wrap the listener in the current Zone.js zone so that Angular's change detection
    // is triggered correctly when the listener runs. This is necessary because popstate
    // events from browser back/forward navigation are dispatched in the root zone, outside
    // of Angular's zone. single-spa overrides `history.replaceState`, which prevents
    // Angular's zone from intercepting these events automatically.
    // See https://github.com/single-spa/single-spa-angular/issues/94 for full context.
    fn = typeof Zone !== 'undefined' && Zone?.current ? Zone.current.wrap(fn, this.source) : fn;

    const onPopStateListener = (event: LocationChangeEvent) => {
      // Instead of calling `fn` directly, push the event into the Subject so it can be
      // debounced and deferred via the switchMap + timer pipeline in the constructor.
      this.onPopState$.next([fn, event]);
    };

    return super.onPopState(onPopStateListener);
  }
}

/**
 * The `PlatformLocation` class is injected into `PathLocationStrategy`,
 * which creates a `Subject` internally for listening to `popstate` events. We provide
 * this custom class in the root injector used during application bootstrapping.
 *
 * THIS IS REQUIRED FOR ALL APPLICATIONS (BOTH ZONE AND ZONELESS). Pass the result of
 * this function to `platformBrowser()` when bootstrapping your application:
 *
 * @example
 * const lifecycles = singleSpaAngular({
 *   bootstrapFunction: async () => {
 *     const platformRef = platformBrowser(getSingleSpaExtraProviders());
 *     return bootstrapApplication(AppComponent, appConfig, { platformRef });
 *   },
 *   template: '<app-root />',
 *   NgZone: 'noop',
 *   Router,
 *   NavigationStart,
 * });
 */
export function getSingleSpaExtraProviders(): StaticProvider[] {
  return [
    {
      provide: SingleSpaPlatformLocation,
      // Using `useClass` would necessitate decorating `SingleSpaPlatformLocation`
      // with `@Injectable`. Using `useFactory` avoids that requirement while still
      // allowing Angular's DI to manage the instance.
      useFactory: () => new SingleSpaPlatformLocation(),
    },
    {
      provide: PlatformLocation,
      // Alias `PlatformLocation` to our custom implementation so that Angular's
      // `PathLocationStrategy` (and anything else that injects `PlatformLocation`)
      // uses `SingleSpaPlatformLocation` transparently.
      useExisting: SingleSpaPlatformLocation,
    },
  ];
}
