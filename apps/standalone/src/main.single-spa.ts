import { NgZone } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { singleSpaAngular, enableProdMode } from 'single-spa-angular';

import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: () => bootstrapApplication(AppComponent, appConfig),
  template: '<standalone-root />',
  Router,
  NavigationStart,
  NgZone,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
