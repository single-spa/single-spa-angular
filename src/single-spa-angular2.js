const defaultOpts = {
  // required opts
  angularPlatform: null,
  mainModule: null,
  template: null,
  // optional opts
  Router: null,
  domElementGetter: null, // only optional if you provide a domElementGetter as a custom prop
};

export default function singleSpaAngular2(userOpts) {
  if (typeof userOpts !== 'object') {
    throw new Error(`single-spa-angular2 requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.angularPlatform) {
    throw new Error(`single-spa-angular2 must be passed opts.angularPlatform. Usually this should be the return value of platformBrowserDynamic()`);
  }

  if (!opts.mainModule) {
    throw new Error(`single-spa-angular2 must be passed opts.mainModule, which is the Angular module to bootstrap`);
  }

  if (typeof opts.template !== 'string') {
    throw new Error(`single-spa-angular2 must be passed opts.template string`);
  }

  return {
    bootstrap: bootstrap.bind(null, opts),
    mount: mount.bind(null, opts),
    unmount: unmount.bind(null, opts),
  };
}

function bootstrap(opts) {
  return Promise.resolve();
}

function mount(opts, props) {
  return Promise
    .resolve()
    .then(() => {
      const domElementGetter = chooseDomElementGetter(opts, props)
      if (!domElementGetter) {
        throw new Error(`cannot mount angular application '${props.name || props.appName}' without a domElementGetter provided either as an opt or a prop`)
      }

      const containerEl = getContainerEl(domElementGetter)
      containerEl.innerHTML = opts.template
    })
    .then(domElementGetter => {
      return opts
        .angularPlatform
        .bootstrapModule(opts.mainModule)
        .then(module => {
          return opts.bootstrappedModule = module;
        })
    })
}

function unmount(opts, props) {
  return new Promise((resolve, reject) => {
    if (opts.Router) {
      const routerRef = opts.bootstrappedModule.injector.get(opts.Router);
      routerRef.dispose();
    }
    opts.bootstrappedModule.destroy();
    delete opts.bootstrappedModule;
    resolve();
  });
}

function getContainerEl(domElementGetter) {
  const element = domElementGetter();
  if (!element) {
    throw new Error(`domElementGetter did not return a valid dom element`);
  }

  return element;
}

function chooseDomElementGetter(opts, props) {
  return props && props.customProps && props.customProps.domElementGetter ? props.customProps.domElementGetter : opts.domElementGetter
}
