import { NgZone, NgModuleRef, Type } from '@angular/core';
import { AppProps } from 'single-spa';

export type DomElementGetter = () => HTMLElement;

export interface SingleSpaAngularOpts {
  NgZone: typeof NgZone;
  bootstrapFunction(props: AppProps): Promise<NgModuleRef<any>>;
  updateFunction?(props: AppProps): Promise<any>;
  template: string;
  Router?: Type<any>;
  domElementGetter?(): HTMLElement;
  AnimationEngine?: Type<any>;
}

export interface BootstrappedSingleSpaAngularOpts extends SingleSpaAngularOpts {
  bootstrappedNgZone: NgZone;
  bootstrappedModule: NgModuleRef<any>;
  routingEventListener: () => void;
  zoneIdentifier: string;
}
