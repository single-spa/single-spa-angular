import * as i0 from '@angular/core';
import { input, effect, untracked, afterNextRender, inject, DestroyRef, Component, ChangeDetectionStrategy, NgModule } from '@angular/core';

class ParcelComponent {
  constructor(host) {
    this.host = host;
    this.config = input(null);
    this.mountParcel = input(null);
    this.onParcelMount = input(null);
    this.wrapWith = input('div');
    this.customProps = input({});
    this.appendTo = input(null);
    this.handleError = input(error => console.error(error));
    this.hasError = false;
    this.wrapper = null;
    this.parcel = null;
    this.task = null;
    effect(() => {
      const customProps = this.customProps();
      untracked(() => {
        this.scheduleTask("update" /* Action.Update */, () => {
          this.parcel?.update?.(customProps);
        });
      });
    });
    afterNextRender(() => {
      this.scheduleTask("mount" /* Action.Mount */, () => {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && this.mountParcel === null) {
          throw new Error('single-spa-angular: the [mountParcel] binding is required when using the <parcel> component. You can either (1) import mountRootParcel from single-spa or (2) use the mountParcel prop provided to single-spa applications.');
        }
        this.wrapper = document.createElement(this.wrapWith());
        const appendTo = this.appendTo();
        if (appendTo !== null) {
          appendTo.appendChild(this.wrapper);
        } else {
          this.host.nativeElement.appendChild(this.wrapper);
        }
        const mountParcel = this.mountParcel();
        this.parcel = mountParcel(this.config(), {
          ...this.customProps(),
          domElement: this.wrapper
        });
        const onParcelMount = this.onParcelMount();
        if (onParcelMount !== null) {
          this.parcel.mountPromise.then(onParcelMount);
        }
        this.unmounted = false;
        return this.parcel.mountPromise;
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.scheduleTask("unmount" /* Action.Unmount */, () => {
        if (this.parcel?.getStatus() === 'MOUNTED') {
          return this.parcel.unmount();
        }
      });
      if (this.wrapper !== null) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }
      this.unmounted = true;
    });
  }
  scheduleTask(action, task) {
    if (this.hasError && action !== "unmount" /* Action.Unmount */) {
      // In an error state, we don't do anything anymore except for unmounting
      return;
    }
    this.task = (this.task || Promise.resolve()).then(() => {
      if (this.unmounted && action !== "unmount" /* Action.Unmount */) {
        // Never do anything once the angular component unmounts
        return;
      }
      return task();
    }).catch(error => {
      this.task = Promise.resolve();
      this.hasError = true;
      if (error?.message) {
        error.message = `During '${action}', parcel threw an error: ${error.message}`;
      }
      const handleError = this.handleError();
      if (typeof handleError === 'function') {
        handleError(error);
      } else {
        setTimeout(() => {
          throw error;
        });
      }
      // No more things to do should be done -- the parcel is in an error state
      throw error;
    });
  }
  /** @nocollapse */
  static {
    this.ɵfac = function ParcelComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || ParcelComponent)(i0.ɵɵdirectiveInject(i0.ElementRef));
    };
  }
  /** @nocollapse */
  static {
    this.ɵcmp = /* @__PURE__ */i0.ɵɵdefineComponent({
      type: ParcelComponent,
      selectors: [["parcel"]],
      inputs: {
        config: [1, "config"],
        mountParcel: [1, "mountParcel"],
        onParcelMount: [1, "onParcelMount"],
        wrapWith: [1, "wrapWith"],
        customProps: [1, "customProps"],
        appendTo: [1, "appendTo"],
        handleError: [1, "handleError"]
      },
      decls: 0,
      vars: 0,
      template: function ParcelComponent_Template(rf, ctx) {},
      encapsulation: 2,
      changeDetection: 0
    });
  }
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ParcelComponent, [{
    type: Component,
    args: [{
      selector: 'parcel',
      template: '',
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true
    }]
  }], () => [{
    type: i0.ElementRef
  }], null);
})();
class ParcelModule {
  /** @nocollapse */static {
    this.ɵfac = function ParcelModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || ParcelModule)();
    };
  }
  /** @nocollapse */
  static {
    this.ɵmod = /* @__PURE__ */i0.ɵɵdefineNgModule({
      type: ParcelModule
    });
  }
  /** @nocollapse */
  static {
    this.ɵinj = /* @__PURE__ */i0.ɵɵdefineInjector({});
  }
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ParcelModule, [{
    type: NgModule,
    args: [{
      imports: [ParcelComponent],
      exports: [ParcelComponent]
    }]
  }], null, null);
})();

export { ParcelComponent, ParcelModule };
//# sourceMappingURL=single-spa-angular-parcel.js.map
