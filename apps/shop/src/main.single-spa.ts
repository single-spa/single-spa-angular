import { NavigationStart, Router } from '@angular/router';
import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { singleSpaAngular, provideSingleSpaPlatform } from '@single-spa-community/angular';

import { loadMontserrat } from './fonts';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const lifecycles = singleSpaAngular({
  bootstrapFunction: async () => {
    await loadMontserrat();
    const platformRef = platformBrowser(provideSingleSpaPlatform());
    return bootstrapApplication(AppComponent, appConfig, { platformRef });
  },
  template: '<shop-root />',
  NgZone: 'noop',
  Router,
  NavigationStart,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
// This export is done only for testing purposes, thus we're
// able to access the `Router` class globally when running E2E
// tests with Cypress.
export { Router } from '@angular/router';
