import { VERSION } from '@angular/core';

/**
 * This is very tricky bug fix for Angular 4-8 versions. The only thing we do here
 * is just override the `Location` subscription and wrap `scheduleNavigation`
 * into `ngZone.run(...)`, thus `routed` components will be created inside Angular's zone.
 * The main issue is `back/forward` buttons of browsers, because they invoke
 * `history.back|forward` which dispatch `popstate` event. Since `single-spa`
 * overrides `history.replaceState` Angular's zone cannot intercept this event.
 * Only the root zone is able to intercept all events.
 * See https://github.com/single-spa/single-spa-angular/issues/94 for more detail
 */
export function patchRouter(opts: any): void {
  // If the user didn't provide `{ Router: Router }` then it likely means that they don't
  // use routing in their application.
  if (opts.Router == null) {
    return;
  }

  const router = opts.bootstrappedModule.injector.get(opts.Router, null);

  // If by some reason the `Router` instance wasn't resolved...
  if (router === null) {
    return;
  }

  const scheduleNavigation = scheduleNavigationFactory(router);

  router.locationSubscription.unsubscribe();
  router.locationSubscription = router.location.subscribe(change => {
    const rawUrlTree = router.parseUrl(change['url']);
    const source = change['type'] === 'popstate' ? 'popstate' : 'hashchange';
    const state = change.state && change.state.navigationId ? change.state : null;
    const extras = {
      replaceUrl: true
    };

    opts.bootstrappedNgZone.run(() => 
      setTimeout(() => scheduleNavigation(rawUrlTree, source, state, extras))
    );
  });
}

function scheduleNavigationFactory(router) {
  // Angular versions older than 6 have a different function signature
  // for router.scheduleNavigation().
  const olderThan6 = +VERSION.major < 6;
  return (rawUrlTree, source, state, extras) =>
    olderThan6
      ? router.scheduleNavigation(rawUrlTree, source, extras)
      : router.scheduleNavigation(rawUrlTree, source, state, extras);
}
