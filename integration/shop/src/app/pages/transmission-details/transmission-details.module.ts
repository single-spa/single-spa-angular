import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransmissionDetailsRoutingModule } from './transmission-details-routing.module';

import { TransmissionDetailsComponent } from './transmission-details.component';

@NgModule({
  imports: [CommonModule, TransmissionDetailsRoutingModule],
  declarations: [TransmissionDetailsComponent],
})
export class TransmissionDetailsModule {}
