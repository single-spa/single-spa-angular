import { enableProdMode, NgZone } from '@angular/core';
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
    const ngModuleRef = await platformBrowserDynamic().bootstrapModule(AppModule);
    ngModuleRef.onDestroy(() => {
      // This is used only for testing purposes.
      window.dispatchEvent(new CustomEvent('chatDestroyed'));
    });
    return ngModuleRef;
  },
  template: '<chat-root />',
  NgZone,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
