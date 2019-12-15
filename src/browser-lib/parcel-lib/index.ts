import { NgModule } from "@angular/core";
import { ParcelComponent } from "./parcel.component";

@NgModule({
  declarations: [ParcelComponent],
  exports: [ParcelComponent],
  entryComponents: [ParcelComponent]
})
export class ParcelModule { }
