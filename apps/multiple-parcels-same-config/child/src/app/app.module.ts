import { ApplicationRef, DoBootstrap, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { EmptyRouteComponent } from './empty-route/empty-route.component';

export const AppModule = (name: string) => {
  @NgModule({
    declarations: [AppComponent, EmptyRouteComponent],
    imports: [BrowserAnimationsModule, AppRoutingModule],
    providers: [],
  })
  class AppModule implements DoBootstrap {
    ngDoBootstrap(appRef: ApplicationRef) {
      appRef.bootstrap(AppComponent, `multiple-parcels-same-config-child-${name}`);
    }
  }
  return AppModule;
}
