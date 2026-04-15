import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ParcelModule } from 'single-spa-angular/parcel';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, ParcelModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
