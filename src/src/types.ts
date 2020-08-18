import { NgModuleRef, Type, NgZone } from '@angular/core';
import { AppProps } from 'single-spa';
import { BaseSingleSpaAngularOptions } from 'single-spa-angular/internals';

export interface SingleSpaAngularOptions extends BaseSingleSpaAngularOptions {
  // This might be `noop` if the root module is bootstrapped
  // with `{ ngZone: 'noop' }` options.
  NgZone: typeof NgZone | 'noop';
  bootstrapFunction(props: AppProps): Promise<NgModuleRef<any>>;
  updateFunction?(props: AppProps): Promise<any>;
  Router?: Type<any>;
  domElementGetter?(): HTMLElement;
  AnimationEngine?: Type<any>;
}

export interface BootstrappedSingleSpaAngularOptions extends SingleSpaAngularOptions {
  bootstrappedModule: NgModuleRef<any>;
  // All below properties can be optional in case of
  // `SingleSpaAngularOpts.NgZone` is a `noop` string and not an `NgZone` class.
  bootstrappedNgZone?: NgZone;
  routingEventListener?: () => void;
  zoneIdentifier?: string;
}
