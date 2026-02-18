import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NavigationStart, Router } from '@angular/router';
import {
  singleSpaAngular,
  getSingleSpaExtraProviders,
  enableProdMode,
} from '@single-spa-community/angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: () =>
    platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule, {
      ngZone: 'noop',
    }),
  template: '<navbar-root />',
  NgZone: 'noop',
  Router,
  NavigationStart,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
