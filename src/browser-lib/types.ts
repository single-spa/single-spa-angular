import { NgZone, Type, NgModuleRef } from '@angular/core';
import { AppProps } from 'single-spa';

export interface SingleSpaAngularOpts {
  NgZone: typeof NgZone;
  bootstrapFunction(props: AppProps): Promise<NgModuleRef<unknown>>;
  updateFunction?(props: AppProps): Promise<any>;
  domElementGetter?: any;
  template: string;
  Router?: Type<any>;
  AnimationEngine?: Type<any>;
}

export interface BootstrappedSingleSpaAngularOpts extends SingleSpaAngularOpts {
  bootstrappedNgZone: NgZone;
  bootstrappedModule: NgModuleRef<unknown>;
  routingEventListener: () => void;
  zoneIdentifier: string;
}
