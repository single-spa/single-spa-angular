import { enableProdMode, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { singleSpaAngular, getSingleSpaExtraProviders } from 'single-spa-angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { singleSpaPropsSubject } from './single-spa/single-spa-props';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: singleSpaProps => {
    singleSpaPropsSubject.next(singleSpaProps);
    return platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule);
  },
  template: '<shop-root />',
  Router,
  NgZone,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
