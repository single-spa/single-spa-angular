import { NgModule } from '@angular/core';

import { RoomsRoutingModule } from './rooms-routing.module';

import { RoomsComponent } from './rooms.component';

@NgModule({
  imports: [RoomsRoutingModule],
  declarations: [RoomsComponent],
})
export class RoomsModule {}
