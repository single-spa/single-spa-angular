import { APP_BASE_HREF } from '@angular/common';
import type { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [{ provide: APP_BASE_HREF, useValue: '/chat' }, provideRouter(routes)],
};
