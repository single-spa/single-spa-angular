import { ApplicationRef } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { singleSpaAngular, enableProdMode, getSingleSpaExtraProviders } from 'single-spa-angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: async () => {
    const ngModuleRef = await platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(
      AppModule,
      {
        ngZone: 'noop',
      },
    );

    const appRef = ngModuleRef.injector.get(ApplicationRef);
    const listener = () => appRef.tick();
    window.addEventListener('popstate', listener);

    ngModuleRef.onDestroy(() => {
      window.removeEventListener('popstate', listener);
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
