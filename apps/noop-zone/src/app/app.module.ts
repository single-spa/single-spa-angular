import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserAnimationsModule, AppRoutingModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [{ provide: APP_BASE_HREF, useValue: '/noop-zone' }],
})
export class AppModule {}
