import { registerApplication, mountRootParcel } from "single-spa";
import { chooseDomElementGetter } from "dom-element-getter-helpers";
import { ApplicationConfig, Type, WritableSignal } from "@angular/core";
type CustomProps = Parameters<typeof mountRootParcel>[1];
type Application<Props extends CustomProps> = Extract<
  Parameters<typeof registerApplication<Props>>[1],
  {
    bootstrap: any;
  }
>;
type LifecycleFn<Props extends CustomProps> = Extract<
  Application<Props>["bootstrap"],
  (config: any) => Promise<any>
>;
export type AppProps<Props extends CustomProps> = Parameters<
  LifecycleFn<Props>
>[0];
export declare function singleSpaAngular<Props extends CustomProps>(
  opts: SingleSpaAngularOpts<Props>,
): Application<Props>;
export interface SingleSpaAngularOpts<ExtraProps> {
  appConfig: ApplicationConfig;
  selector?: string;
  rootComponent: Type<unknown>;
  bootstrapApplication(
    rootComponent: SingleSpaAngularOpts<ExtraProps>["rootComponent"],
    appConfig: SingleSpaAngularOpts<ExtraProps>["appConfig"],
  ): Promise<Destroyable>;
  domElementGetter?: Parameters<
    typeof chooseDomElementGetter
  >[0]["domElementGetter"];
  propsInjectionToken: any;
  propsSignal: WritableSignal<AppProps<ExtraProps>>;
}
interface Destroyable {
  destroy(): any;
}
export {};
