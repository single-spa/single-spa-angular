import { NgModuleRef, Type, NgZone, ApplicationRef } from '@angular/core';
import { AppProps } from 'single-spa';
import { BaseSingleSpaAngularOptions } from 'single-spa-angular/internals';

export interface SingleSpaAngularOptions<T = Record<string, unknown>>
  extends BaseSingleSpaAngularOptions {
  // This might be `noop` if the root module is bootstrapped
  // with `{ ngZone: 'noop' }` options.
  NgZone: typeof NgZone | 'noop';
  updateFunction?(props: AppProps): Promise<any>;
  // `Router` and `NavigationStart` should be always provided together.
  Router?: Type<any>;
  NavigationStart?: Type<any>;
  bootstrapFunction(props: AppProps & T): Promise<NgModuleRef<any> | ApplicationRef>;
}

export interface BootstrappedSingleSpaAngularOptions extends SingleSpaAngularOptions {
  bootstrappedNgModuleRefOrAppRef: NgModuleRef<any> | ApplicationRef | null;
  // All below properties can be optional in case of
  // `SingleSpaAngularOpts.NgZone` is a `noop` string and not an `NgZone` class.
  bootstrappedNgZone?: NgZone;
  routingEventListener?: () => void;
  zoneIdentifier?: string;
}
