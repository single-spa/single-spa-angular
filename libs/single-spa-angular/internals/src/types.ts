import { AppProps } from 'single-spa';
import { NgModuleRef } from '@angular/core';

export type DomElementGetter = () => HTMLElement;

export interface BaseSingleSpaAngularOptions {
  template: string | ((props: AppProps) => string);
  domElementGetter?(): HTMLElement;
  bootstrapFunction(props: AppProps): Promise<NgModuleRef<any>>;
}
