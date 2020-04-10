import { BootstrappedSingleSpaAngularOpts } from './single-spa-angular';

export function patchRouter(opts: BootstrappedSingleSpaAngularOpts): void {
  // If the user doesn't use routing in his application then we shouldn't patch location.
  if (opts.Router == null) {
    return;
  }

  const router = opts.bootstrappedModule.injector.get(opts.Router);

  router.locationSubscription.unsubscribe();
  router.locationSubscription = router.location.subscribe(change => {
    let rawUrlTree = router.parseUrl(change.url);

    const source = change.type === 'popstate' ? 'popstate' : 'hashchange';
    const state = change.state && change.state.navigationId ? change.state : null;

    const scheduleNavigation = () =>
      setTimeout(() => {
        router.scheduleNavigation(rawUrlTree, source, state, {
          replaceUrl: true,
        });
      });

    if (opts.NgZone.isInAngularZone()) {
      scheduleNavigation();
    } else {
      opts.bootstrappedNgZone.run(scheduleNavigation);
    }
  });
}
