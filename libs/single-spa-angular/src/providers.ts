import { Location, LocationStrategy, PopStateEvent } from '@angular/common';
import { inject, makeEnvironmentProviders, NgZone } from '@angular/core';
import { SubscriptionLike } from 'rxjs';

/**
 * A custom Angular Location service designed for use in single-spa micro-frontend environments.
 *
 * Problem: When multiple Angular applications share a single browser platform, popstate events
 * are dispatched inside whichever NgZone was active when the platform-level listener was first
 * registered (typically the zone of the first bootstrapped app). This means route changes
 * triggered in one micro-frontend can go undetected by another app's change detection.
 *
 * Solution: Wrap every popstate callback in the current app's NgZone so that Angular's
 * change detection is always triggered in the correct zone, regardless of which app
 * originally registered the platform listener.
 */
export class SingleSpaLocation extends Location {
  private readonly ngZone = inject(NgZone);

  override subscribe(
    onNext: (value: PopStateEvent) => void,
    onThrow?: ((exception: any) => void) | null,
    onReturn?: (() => void) | null,
  ): SubscriptionLike {
    // Re-enter this app's NgZone before invoking the callback.
    // Without this, the callback may run inside a foreign zone (belonging to another
    // micro-frontend), causing change detection to be skipped for this application.
    return super.subscribe(value => this.ngZone.run(() => onNext(value)), onThrow, onReturn);
  }
}

/**
 * Provides the single-spa-aware Location service for an Angular micro-frontend.
 * Add this to your application's providers (e.g. in `bootstrapApplication` or an `NgModule`).
 *
 * @example
 * bootstrapApplication(AppComponent, {
 *   providers: [provideSingleSpa()]
 * });
 */
export function provideSingleSpa() {
  return makeEnvironmentProviders([
    {
      // Replace the default Angular Location with our zone-aware implementation.
      provide: Location,
      useFactory: () => new SingleSpaLocation(inject(LocationStrategy)),
    },
  ]);
}
