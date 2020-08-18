import { NgModuleRef, Type, NgZone } from '@angular/core';
import { AppProps } from 'single-spa';

export type DomElementGetter = () => HTMLElement;

export interface SingleSpaAngularOpts {
  // This might be `noop` if the root module is bootstrapped
  // with `{ ngZone: 'noop' }` options.
  NgZone: typeof NgZone | 'noop';
  bootstrapFunction(props: AppProps): Promise<NgModuleRef<any>>;
  updateFunction?(props: AppProps): Promise<any>;
  template: string;
  Router?: Type<any>;
  domElementGetter?(): HTMLElement;
  AnimationEngine?: Type<any>;
}

export interface BootstrappedSingleSpaAngularOpts extends SingleSpaAngularOpts {
  bootstrappedModule: NgModuleRef<any>;
  // All below properties can be optional in case of
  // `SingleSpaAngularOpts.NgZone` is a `noop` string and not an `NgZone` class.
  bootstrappedNgZone?: NgZone;
  routingEventListener?: () => void;
  zoneIdentifier?: string;
}
