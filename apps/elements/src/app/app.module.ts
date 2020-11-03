import { NgModule, Injector, DoBootstrap } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, HttpClientModule],
  declarations: [AppComponent],
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}

  ngDoBootstrap(): void {
    customElements.define(
      'elements-root',
      createCustomElement(AppComponent, { injector: this.injector }),
    );
  }
}
