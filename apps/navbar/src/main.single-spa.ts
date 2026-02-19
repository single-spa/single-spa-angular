import { NavigationStart, Router } from '@angular/router';
import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { getSingleSpaExtraProviders, singleSpaAngular } from '@single-spa-community/angular';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const lifecycles = singleSpaAngular({
  bootstrapFunction: () => {
    const platformRef = platformBrowser(getSingleSpaExtraProviders());
    return bootstrapApplication(AppComponent, appConfig, { platformRef });
  },
  template: '<navbar-root />',
  NgZone: 'noop',
  Router,
  NavigationStart,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
