import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChatComponent } from './components/chat/chat.component';

@NgModule({
  imports: [BrowserAnimationsModule],
  declarations: [AppComponent, ChatComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
