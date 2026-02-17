import { singleSpaAngularElements } from 'single-spa-angular/elements';
import { getSingleSpaExtraProviders } from 'single-spa-angular';

import { AppModule } from './app/app.module';

// @ts-ignore
import unmountableStyles from './main.scss?unmountable';
import { platformBrowser } from '@angular/platform-browser';

const lifecycles = singleSpaAngularElements({
  template: '<elements-root />',
  bootstrapFunction: async () => {
    unmountableStyles.use();

    const ngModuleRef = await platformBrowser(getSingleSpaExtraProviders()).bootstrapModule(
      AppModule,
    );

    ngModuleRef.onDestroy(() => unmountableStyles.unuse());

    return ngModuleRef;
  },
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
