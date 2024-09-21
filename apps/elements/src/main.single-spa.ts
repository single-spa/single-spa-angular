import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { singleSpaAngularElements } from 'single-spa-angular/elements';
import { enableProdMode, getSingleSpaExtraProviders } from 'single-spa-angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// @ts-ignore
import unmountableStyles from './main.scss?unmountable';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngularElements({
  template: '<elements-root />',
  bootstrapFunction: async () => {
    unmountableStyles.use();

    const ngModuleRef = await platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(
      AppModule,
      {
        ngZone: 'noop',
      },
    );

    ngModuleRef.onDestroy(() => unmountableStyles.unuse());

    return ngModuleRef;
  },
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
