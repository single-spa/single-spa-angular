import { importProvidersFrom, NgZone } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { singleSpaAngular, enableProdMode } from 'single-spa-angular';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: () =>
    bootstrapApplication(AppComponent, {
      providers: [
        importProvidersFrom(BrowserAnimationsModule),
        importProvidersFrom(
          RouterModule.forRoot([
            {
              path: '',
              loadComponent: () =>
                import('./app/pages/home/home.component').then(m => m.HomeComponent),
            },
          ]),
        ),
        { provide: APP_BASE_HREF, useValue: '/standalone' },
      ],
    }),
  template: '<standalone-root />',
  Router,
  NavigationStart,
  NgZone,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
