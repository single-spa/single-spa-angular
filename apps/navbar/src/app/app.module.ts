import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { provideRouter, RouterOutlet } from '@angular/router';

import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { PrimaryNavComponent } from './components/primary-nav/primary-nav.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '/',
    },

    provideRouter(routes),
  ],
  imports: [BrowserModule, RouterOutlet, PrimaryNavComponent],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
