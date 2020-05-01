import { NgModuleRef, Type } from '@angular/core';
import { AppProps } from 'single-spa';

export type DomElementGetter = () => HTMLElement;

export interface SingleSpaAngularOpts {
  NgZone: typeof import('@angular/core').NgZone | 'noop';
  bootstrapFunction(props: AppProps): Promise<NgModuleRef<any>>;
  updateFunction?(props: AppProps): Promise<any>;
  template: string;
  Router?: Type<any>;
  domElementGetter?(): HTMLElement;
  AnimationEngine?: Type<any>;
}

export interface BootstrappedSingleSpaAngularOpts extends SingleSpaAngularOpts {
  bootstrappedNgZone?: import('@angular/core').NgZone;
  bootstrappedModule: NgModuleRef<any>;
  routingEventListener?: () => void;
  zoneIdentifier?: string;
}
