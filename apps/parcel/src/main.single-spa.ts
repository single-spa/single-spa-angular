import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { singleSpaAngular, enableProdMode } from '@single-spa-community/angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: () => platformBrowserDynamic().bootstrapModule(AppModule, { ngZone: 'noop' }),
  template: '<parcel-root />',
  NgZone: 'noop',
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
