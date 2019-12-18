import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Parcel, ParcelConfig } from 'single-spa';


@Component({
  selector: 'parcel',
  template: `
  <div #parcelDiv></div>
  `
})
export class ParcelComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('parcelDiv') parcelDiv: ElementRef;
  @Input() config: ParcelConfig;
  @Input() mountParcel: any;
  @Input() onParcelMount: () => void;
  @Input() wrapWith = 'div';
  @Input() customProps: any;
  @Input() appendTo: any;
  @Input() handleError = err => console.error(err);


  createdDomElement: any;
  hasError: boolean;
  unmounted: any;
  nextThingToDo: Promise<any>;
  parcel: Parcel;

  constructor() {
  }

  ngOnInit() {
    if (!this.config) {
      throw new Error(`single-spa-angular's Parcel component requires the 'config' prop to either be a parcel config or a loading function that returns a promise. See https://github.com/CanopyTax/single-spa-angular`)
    }

    this.addThingToDo('mount', () => {
      const mountParcel = this.mountParcel;
      if (!mountParcel) {
        throw new Error(`
				  <parcel> was not passed a mountParcel prop.
				  If you are using <parcel> within a module that is not a single-spa application, you will need to import mountRootParcel from single-spa and pass it into <parcel> as a mountParcel prop
				`);
      }
      let domElement: HTMLElement;

      if (this.appendTo) {
        this.createdDomElement = domElement = document.createElement(this.wrapWith);
        this.appendTo.appendChild(domElement);
      } else {
        this.createdDomElement = domElement = document.createElement(this.wrapWith);
        this.parcelDiv.nativeElement.appendChild(domElement);
      }

      this.parcel = mountParcel(this.config, { domElement, ...this.customProps });

      if (this.onParcelMount) {
        this.parcel.mountPromise.then(this.onParcelMount);
      }
      this.unmounted = false;
      return this.parcel.mountPromise;
    })
  }

  ngOnChanges() {
    this.addThingToDo('update', () => {
      if (this.parcel && this.parcel.update) {
        return this.parcel.update(this.customProps)
      }
    })
  }

  ngOnDestroy() {
    this.addThingToDo('unmount', () => {
      if (this.parcel && this.parcel.getStatus() === "MOUNTED") {
        return this.parcel.unmount()
      }
    })

    if (this.createdDomElement) {
      this.createdDomElement.parentNode.removeChild(this.createdDomElement)
    }

    this.unmounted = true
  }

  addThingToDo(action, thing) {
    if (this.hasError && action !== 'unmount') {
      // In an error state, we don't do anything anymore except for unmounting
      return
    }

    this.nextThingToDo = (this.nextThingToDo || Promise.resolve())
      .then((...args) => {
        if (this.unmounted && action !== 'unmount') {
          // Never do anything once the angular component unmounts
          return
        }

        return thing(...args)
      })
      .catch(err => {
        this.nextThingToDo = Promise.resolve() // reset so we don't .then() the bad promise again
        this.hasError = true;

        if (err && err.message) {
          err.message = `During '${action}', parcel threw an error: ${err.message}`
        }

        if (this.handleError) {
          this.handleError(err)
        } else {
          setTimeout(() => { throw err })
        }

        // No more things to do should be done -- the parcel is in an error state
        throw err
      })
  }

}
