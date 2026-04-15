import { AppProps } from 'single-spa';
import { ApplicationRef, NgModuleRef } from '@angular/core';

export type DomElementGetter = (props: any) => HTMLElement;

export interface BaseSingleSpaAngularOptions {
  template: string;
  domElementGetter?: DomElementGetter;
  bootstrapFunction(props: AppProps): Promise<NgModuleRef<any> | ApplicationRef>;
}
