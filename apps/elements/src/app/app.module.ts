import {
  NgModule,
  DoBootstrap,
  createEnvironmentInjector,
  EnvironmentInjector,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';

@NgModule({ imports: [BrowserModule] })
export class AppModule implements DoBootstrap {
  constructor(private injector: EnvironmentInjector) {}

  ngDoBootstrap(): void {
    customElements.define(
      'elements-root',
      createCustomElement(AppComponent, {
        injector: createEnvironmentInjector([provideHttpClient()], this.injector),
      }),
    );
  }
}
