import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransmissionsRoutingModule } from './transmissions-routing.module';

import { TransmissionsComponent } from './transmissions.component';

@NgModule({
  imports: [CommonModule, TransmissionsRoutingModule],
  declarations: [TransmissionsComponent],
})
export class TransmissionsModule {}
