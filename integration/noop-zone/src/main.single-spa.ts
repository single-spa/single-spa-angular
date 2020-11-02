import { enableProdMode, ApplicationRef } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { singleSpaAngular } from 'single-spa-angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { singleSpaPropsSubject } from './single-spa/single-spa-props';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: async singleSpaProps => {
    singleSpaPropsSubject.next(singleSpaProps);

    const ngModuleRef = await platformBrowserDynamic().bootstrapModule(AppModule, {
      ngZone: 'noop',
    });

    const appRef = ngModuleRef.injector.get(ApplicationRef);
    const listener = () => appRef.tick();
    window.addEventListener('popstate', listener);

    ngModuleRef.onDestroy(() => {
      window.removeEventListener('popstate', listener);
      // This is used only for testing purposes.
      window.dispatchEvent(new CustomEvent('noopZoneAppDestroyed'));
    });

    return ngModuleRef;
  },
  template: '<noop-zone-root />',
  Router,
  NavigationStart,
  NgZone: 'noop',
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
