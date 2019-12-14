import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ParcelComponent } from "./parcel.component";

@NgModule({
  imports: [CommonModule],
  declarations: [ParcelComponent],
  exports: [ParcelComponent],
  entryComponents: [ParcelComponent]
})
export class ParcelModule { }
