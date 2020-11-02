import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmptyRouteComponent } from './components/empty-route/empty-route.component';
import { PrimaryNavComponent } from './components/primary-nav/primary-nav.component';

@NgModule({
  imports: [BrowserModule, AppRoutingModule],
  declarations: [AppComponent, EmptyRouteComponent, PrimaryNavComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
