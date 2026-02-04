import { getContainerElementAndSetTemplate } from 'single-spa-angular/internals';

const defaultOptions = {
  element: null,
  template: null,
  ngModuleRefOrAppRef: null,
  bootstrapFunction: null,
  domElementGetter: undefined
};
async function bootstrap(options, props) {
  if (options.ngModuleRefOrAppRef !== null) {
    return;
  }
  // We call `bootstrapFunction()` inside the bootstrap lifecycle hook
  // because Angular modules that expose custom elements should be
  // bootstrapped only once.
  options.ngModuleRefOrAppRef = await options.bootstrapFunction(props);
}
async function mount(options, props) {
  const containerElement = getContainerElementAndSetTemplate(options, props);
  // `options.template` which can be `<app-element />` is not a valid selector
  // for `document.querySelector`, thus we retrieve this custom element
  // via this property.
  options.element = containerElement.firstElementChild;
}
function unmount(options) {
  return Promise.resolve().then(() => {
    // Removing custom element from DOM is enough since it will trigger
    // `disconnectedCallback()` and Angular will dispose all resources.
    options.element.parentElement.removeChild(options.element);
    options.element = null;
  });
}
function singleSpaAngularElements(userOptions) {
  const options = {
    ...defaultOptions,
    ...userOptions
  };
  return {
    bootstrap: bootstrap.bind(null, options),
    mount: mount.bind(null, options),
    unmount: unmount.bind(null, options)
  };
}

export { singleSpaAngularElements };
//# sourceMappingURL=single-spa-angular-elements.js.map
