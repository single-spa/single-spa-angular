import { NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NavigationStart, Router } from '@angular/router';
import { singleSpaAngular, getSingleSpaExtraProviders, enableProdMode } from 'single-spa-angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { singleSpaPropsSubject } from './single-spa/single-spa-props';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: async singleSpaProps => {
    singleSpaPropsSubject.next(singleSpaProps);
    const ngModuleRef = await platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(
      AppModule,
    );
    ngModuleRef.onDestroy(() => {
      // This is used only for testing purposes.
      window.dispatchEvent(new CustomEvent('chatDestroyed'));
    });
    return ngModuleRef;
  },
  template: '<chat-root />',
  NgZone,
  Router,
  NavigationStart,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
