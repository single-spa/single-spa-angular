import { NavigationStart, Router } from '@angular/router';
import { getSingleSpaExtraProviders, singleSpaAngular } from 'single-spa-angular';

import { singleSpaPropsSubject } from './single-spa/single-spa-props';
import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const lifecycles = singleSpaAngular({
  bootstrapFunction: async singleSpaProps => {
    const platformRef = platformBrowser(getSingleSpaExtraProviders());
    singleSpaPropsSubject.next(singleSpaProps);
    const appRef = await bootstrapApplication(AppComponent, appConfig, { platformRef });
    appRef.onDestroy(() => {
      // This is used only for testing purposes.
      window.dispatchEvent(new CustomEvent('chatDestroyed'));
    });
    return appRef;
  },
  template: '<chat-root />',
  NgZone: 'noop',
  Router,
  NavigationStart,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
