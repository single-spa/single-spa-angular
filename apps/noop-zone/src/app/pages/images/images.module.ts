import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImagesRoutingModule } from './images-routing.module';

import { ImagesComponent } from './images.component';

@NgModule({
  imports: [CommonModule, ImagesRoutingModule],
  declarations: [ImagesComponent],
})
export class ImagesModule {}
