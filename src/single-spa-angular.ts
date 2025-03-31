import { registerApplication, mountRootParcel } from "single-spa";
import { chooseDomElementGetter } from "dom-element-getter-helpers";
import { ApplicationConfig, Type } from "@angular/core";

type CustomProps = Parameters<typeof mountRootParcel>[1];
type Application<Props extends CustomProps> = Extract<
  Parameters<typeof registerApplication<Props>>[1],
  { bootstrap }
>;
type LifecycleFn<Props extends CustomProps> = Extract<
  Application<Props>["bootstrap"],
  (config: any) => Promise<any>
>;
export type AppProps<Props extends CustomProps> = Parameters<
  LifecycleFn<Props>
>[0];

export function singleSpaAngular<Props extends CustomProps>(
  opts: SingleSpaAngularOpts<Props>,
): Application<Props> {
  let applicationRef: Destroyable | null = null;
  let selectorElement: HTMLElement | null = null;
  const selector = opts.selector ?? opts.rootComponent["ɵcmp"]?.selectors?.[0];
  let currentProps: AppProps<Props> | null = null;

  if (!selector) {
    throw Error(
      `single-spa-angular: opts.selector must be defined if opts.rootComponent isn't aot compiled`,
    );
  }

  return {
    async bootstrap(props: AppProps<Props>) {
      currentProps = props;
    },
    async mount(props: AppProps<Props>) {
      const domElement = chooseDomElementGetter(opts, props)();
      selectorElement = document.createElement(selector);
      domElement.appendChild(selectorElement);
      opts.appConfig.providers.push({
        provide: opts.propsInjectionToken,
        useFactory: () => currentProps,
      });
      applicationRef = await opts.bootstrapApplication(
        opts.rootComponent,
        opts.appConfig,
      );
    },
    async update(props: AppProps<Props>) {
      currentProps = props;
    },
    async unmount(props: AppProps<Props>) {
      currentProps = props;
      await applicationRef!.destroy();
      applicationRef = null;
      selectorElement.remove();
    },
  };
}

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
}

interface Destroyable {
  destroy(): any;
}
