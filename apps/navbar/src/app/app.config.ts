import { APP_BASE_HREF } from '@angular/common';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideSingleSpa } from '@single-spa-community/angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSingleSpa(),

    {
      provide: APP_BASE_HREF,
      useValue: '/',
    },

    provideRouter(routes),
  ],
};
