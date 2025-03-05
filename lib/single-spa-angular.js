import { chooseDomElementGetter } from "dom-element-getter-helpers";
export function singleSpaAngular(opts) {
  let applicationRef = null;
  let selectorElement = null;
  const selector = opts.selector ?? opts.rootComponent["ɵcmp"]?.selectors?.[0];
  if (!selector) {
    throw Error(
      `single-spa-angular: opts.selector must be defined if opts.rootComponent isn't aot compiled`,
    );
  }
  return {
    async bootstrap(props) {
      opts.propsSignal.set(props);
    },
    async mount(props) {
      const domElement = chooseDomElementGetter(opts, props)();
      selectorElement = document.createElement(selector);
      domElement.appendChild(selectorElement);
      opts.propsSignal.set(props);
      opts.appConfig.providers.push({
        provide: opts.propsInjectionToken,
        useValue: opts.propsSignal,
      });
      applicationRef = await opts.bootstrapApplication(
        opts.rootComponent,
        opts.appConfig,
      );
    },
    async update(props) {
      opts.propsSignal.set(props);
    },
    async unmount(props) {
      await applicationRef.destroy();
      opts.propsSignal.set(props);
      applicationRef = null;
      selectorElement.remove();
    },
  };
}
