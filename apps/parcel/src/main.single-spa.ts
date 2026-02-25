import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { provideSingleSpaPlatform, singleSpaAngular } from '@single-spa-community/angular';

import { AppComponent } from './app/app.component';

const lifecycles = singleSpaAngular({
  bootstrapFunction: () => {
    const platformRef = platformBrowser(provideSingleSpaPlatform());
    return bootstrapApplication(
      AppComponent,
      {
        providers: [],
      },
      { platformRef },
    );
  },
  template: '<parcel-root />',
  NgZone: 'noop',
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
