import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { EmptyRouteComponent } from './empty-route/empty-route.component';

@NgModule({
  imports: [BrowserAnimationsModule, AppRoutingModule],
  declarations: [AppComponent, EmptyRouteComponent],
  bootstrap: [AppComponent],
  providers: [],
})
export class AppModule {}
