import { enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpClient } from '@angular/common/http';
import { singleSpaAngularElements } from 'single-spa-angular/elements';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngularElements({
  template: '<elements-root />',
  bootstrapFunction: () => platformBrowserDynamic().bootstrapModule(AppModule),
  withProperties: async (ngModuleRef: NgModuleRef<AppModule>) => {
    const http = ngModuleRef.injector.get(HttpClient);
    const users = await http.get('https://jsonplaceholder.typicode.com/users').toPromise();
    return { users };
  },
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
