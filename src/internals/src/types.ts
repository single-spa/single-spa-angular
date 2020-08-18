export type DomElementGetter = () => HTMLElement;

export interface BaseSingleSpaAngularOptions {
  template: string;
  domElementGetter?(): HTMLElement;
}
