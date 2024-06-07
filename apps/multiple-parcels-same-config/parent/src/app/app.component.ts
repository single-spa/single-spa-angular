import { Component, ElementRef, ViewChild } from '@angular/core';
import { mountRootParcel } from 'single-spa';

@Component({
  selector: 'multiple-parcels-same-config',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor() {}

  @ViewChild('parcelContainer1') parcelContainer1!: ElementRef;
  @ViewChild('parcelContainer2') parcelContainer2!: ElementRef;

  mountRootParcel = mountRootParcel;

  props1 = { id: 1 };
  props2 = { id: 2 };

  parcel1: any;
  parcel2: any;

  config() {
    return (window as any).System.import('multiple-parcels-same-config-child');
  }

  mount1() {
    this.parcel1 = this.mountRootParcel(this.config, {
      domElement: this.parcelContainer1.nativeElement,
      ...this.props1,
    });
  }

  mount2() {
    this.parcel2 = this.mountRootParcel(this.config, {
      domElement: this.parcelContainer2.nativeElement,
      ...this.props2,
    });
  }

  unmount1() {
    this.parcel1.unmount();
  }

  unmount2() {
    this.parcel2.unmount();
  }
}
