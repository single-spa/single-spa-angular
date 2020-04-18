import { Component, OnInit, OnDestroy, Input, OnChanges, ElementRef } from '@angular/core';
import { Parcel, ParcelConfig, AppProps } from 'single-spa';

@Component({
  selector: 'parcel',
  template: '<div></div>',
})
export class ParcelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() config!: ParcelConfig;
  @Input() mountParcel!: AppProps['mountParcel'];
  @Input() onParcelMount: (() => void) | null = null;
  @Input() wrapWith = 'div';
  @Input() customProps: object = {};
  @Input() appendTo?: Node | null = null;
  @Input() handleError = (error: Error) => console.error(error);

  createdDomElement: HTMLElement | null = null;
  hasError = false;
  unmounted = false;
  nextThingToDo!: Promise<any>;
  parcel!: Parcel;

  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit() {
    if (!this.config) {
      throw new Error(
        `single-spa-angular's Parcel component requires the [config] binding to either be a parcel config or a loading function that returns a promise. See https://github.com/CanopyTax/single-spa-angular`,
      );
    }

    this.addThingToDo('mount', () => {
      const mountParcel = this.mountParcel;
      if (!mountParcel) {
        throw new Error(`
				  <parcel> was not passed a [mountParcel] binding.
				  If you are using <parcel> within a module that is not a single-spa application, you will need to import mountRootParcel from single-spa and pass it into <parcel> as a [mountParcel] binding
				`);
      }
      let domElement: HTMLElement;

      if (this.appendTo) {
        this.createdDomElement = domElement = document.createElement(this.wrapWith);
        this.appendTo.appendChild(domElement);
      } else {
        this.createdDomElement = domElement = document.createElement(this.wrapWith);
        // Except of having `@ViewChild` we can simply get the first child element.
        const parcelDiv = this.host.nativeElement.children[0];
        parcelDiv.appendChild(domElement);
      }

      this.parcel = mountParcel(this.config, { domElement, ...this.customProps });

      if (this.onParcelMount) {
        this.parcel.mountPromise.then(this.onParcelMount);
      }
      this.unmounted = false;
      return this.parcel.mountPromise;
    });
  }

  ngOnChanges() {
    this.addThingToDo('update', () => {
      if (this.parcel && this.parcel.update) {
        return this.parcel.update(this.customProps);
      }
    });
  }

  ngOnDestroy() {
    this.addThingToDo('unmount', () => {
      if (this.parcel && this.parcel.getStatus() === 'MOUNTED') {
        return this.parcel.unmount();
      }
    });

    if (this.createdDomElement) {
      this.createdDomElement.parentNode!.removeChild(this.createdDomElement);
    }

    this.unmounted = true;
  }

  addThingToDo(action: string, thing: Function) {
    if (this.hasError && action !== 'unmount') {
      // In an error state, we don't do anything anymore except for unmounting
      return;
    }

    this.nextThingToDo = (this.nextThingToDo || Promise.resolve())
      .then((...args) => {
        if (this.unmounted && action !== 'unmount') {
          // Never do anything once the angular component unmounts
          return;
        }

        return thing(...args);
      })
      .catch(error => {
        this.nextThingToDo = Promise.resolve(); // reset so we don't .then() the bad promise again
        this.hasError = true;

        if (error && error.message) {
          error.message = `During '${action}', parcel threw an error: ${error.message}`;
        }

        if (typeof this.handleError === 'function') {
          this.handleError(error);
        } else {
          setTimeout(() => {
            throw error;
          });
        }

        // No more things to do should be done -- the parcel is in an error state
        throw error;
      });
  }
}
