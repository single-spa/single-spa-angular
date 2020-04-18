/* eslint-disable @typescript-eslint/no-use-before-define */
import { AppProps, LifeCycles } from 'single-spa'

import { patchRouter } from './patch-router';

const defaultOpts = {
  // required opts
  NgZone: null,
  bootstrapFunction: null,
  template: null,
  // optional opts
  Router: undefined,
  domElementGetter: undefined, // only optional if you provide a domElementGetter as a custom prop
  AnimationEngine: undefined,
  updateFunction: () => Promise.resolve()
};

export default function singleSpaAngular(userOpts: SingleSpaAngularOpts): LifeCycles {
  if (typeof userOpts !== "object") {
    throw Error("single-spa-angular requires a configuration object");
  }

  const opts: SingleSpaAngularOpts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (typeof opts.bootstrapFunction !== 'function') {
    throw Error("single-spa-angular must be passed an opts.bootstrapFunction")
  }

  if (typeof opts.template !== "string") {
    throw Error("single-spa-angular must be passed opts.template string");
  }

  if (!opts.NgZone) {
    throw Error(`single-spa-angular must be passed the NgZone opt`);
  }

  return {
    bootstrap: bootstrap.bind(null, opts),
    mount: mount.bind(null, opts),
    unmount: unmount.bind(null, opts),
    update: opts.updateFunction
  };
}

function bootstrap(opts, props) {
  return Promise.resolve().then(() => {
    // In order for multiple Angular apps to work concurrently on a page, they each need a unique identifier.
    opts.zoneIdentifier = `single-spa-angular:${props.name || props.appName}`;

    // This is a hack, since NgZone doesn't allow you to configure the property that identifies your zone.
    // See https://github.com/PlaceMe-SAS/single-spa-angular-cli/issues/33,
    // https://github.com/single-spa/single-spa-angular/issues/47,
    // https://github.com/angular/angular/blob/a14dc2d7a4821a19f20a9547053a5734798f541e/packages/core/src/zone/ng_zone.ts#L144,
    // and https://github.com/angular/angular/blob/a14dc2d7a4821a19f20a9547053a5734798f541e/packages/core/src/zone/ng_zone.ts#L257
    opts.NgZone.isInAngularZone = function() {
      // @ts-ignore
      return window.Zone.current._properties[opts.zoneIdentifier] === true;
    }

    opts.routingEventListener = function() {
      opts.bootstrappedNgZone.run(() => {
        // See https://github.com/single-spa/single-spa-angular/issues/86
        // Zone is unaware of the single-spa navigation change and so Angular change detection doesn't work
        // unless we tell Zone that something happened
      })
    }
  });
}

function mount(opts, props) {
  return Promise
    .resolve()
    .then(() => {
      const domElementGetter = chooseDomElementGetter(opts, props);
      if (!domElementGetter) {
        throw Error(`cannot mount angular application '${props.name || props.appName}' without a domElementGetter provided either as an opt or a prop`);
      }

      const containerEl = getContainerEl(domElementGetter);
      containerEl.innerHTML = opts.template;
    })
    .then(() => {
      const bootstrapPromise = opts.bootstrapFunction(props)
      if (!(bootstrapPromise instanceof Promise)) {
        throw Error(`single-spa-angular: the opts.bootstrapFunction must return a promise, but instead returned a '${typeof bootstrapPromise}' that is not a Promise`);
      }

      return bootstrapPromise.then(module => {
        if (!module || typeof module.destroy !== 'function') {
          throw Error(`single-spa-angular: the opts.bootstrapFunction returned a promise that did not resolve with a valid Angular module. Did you call platformBrowser().bootstrapModuleFactory() correctly?`)
        }
        opts.bootstrappedNgZone = module.injector.get(opts.NgZone)
        opts.bootstrappedNgZone._inner._properties[opts.zoneIdentifier] = true;
        window.addEventListener('single-spa:routing-event', opts.routingEventListener)
        opts.bootstrappedModule = module;
        patchRouter(opts);
        return module;
      });
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function unmount(opts, props) {
  return Promise.resolve().then(() => {
    if (opts.Router) {
      // Workaround for https://github.com/angular/angular/issues/19079
      const routerRef = opts.bootstrappedModule.injector.get(opts.Router);
      routerRef.dispose();
    }
    window.removeEventListener('single-spa:routing-event', opts.routingEventListener)
    opts.bootstrappedModule.destroy();
    if (opts.AnimationEngine) {
      /*
      The BrowserAnimationsModule does not clean up after itself :'(. When you unmount/destroy the main module, the
      BrowserAnimationsModule uses an AnimationRenderer thing to remove dom elements from the page. But the AnimationRenderer
      defers the actual work to the TransitionAnimationEngine to do this, and the TransitionAnimationEngine doesn't actually
      remove the dom node, but just calls "markElementAsRemoved()".

      See https://github.com/angular/angular/blob/db62ccf9eb46ee89366ade586365ea027bb93eb1/packages/animations/browser/src/render/transition_animation_engine.ts#L717

      What markAsRemovedDoes is put it into an array called "collectedLeaveElements", which is all the elements that should be removed
      after the DOM has had a chance to do any animations.

      See https://github.com/angular/angular/blob/master/packages/animations/browser/src/render/transition_animation_engine.ts#L525

      The actual dom nodes aren't removed until the TransitionAnimationEngine "flushes".

      See https://github.com/angular/angular/blob/db62ccf9eb46ee89366ade586365ea027bb93eb1/packages/animations/browser/src/render/transition_animation_engine.ts#L851

      Unfortunately, though, that "flush" will never happen, since the entire module is being destroyed and there will be no more flushes.
      So what we do in this code is force one more flush of the animations after the module is destroyed.

      Ideally, we would do this by getting the TransitionAnimationEngine directly and flushing it. Unfortunately, though, it's private class
      that cannot be imported and is not provided to the dependency injector. So, instead, we get its wrapper class, AnimationEngine, and then
      access its private variable reference to the TransitionAnimationEngine so that we can call flush.
      */
      const animationEngine = opts.bootstrappedModule.injector.get(opts.AnimationEngine);
      animationEngine._transitionEngine.flush();
    }
    delete opts.bootstrappedModule;
  });
}

function getContainerEl(domElementGetter) {
  const element = domElementGetter();
  if (!element) {
    throw Error("domElementGetter did not return a valid dom element");
  }

  return element;
}

function chooseDomElementGetter(opts, props) {
  props = props && props.customProps ? props.customProps : props
  if (props.domElement) {
    return () => props.domElement
  } else if (props.domElementGetter) {
    return props.domElementGetter
  } else if (opts.domElementGetter) {
    return opts.domElementGetter
  } else {
    return defaultDomElementGetter(props.name)
  }
}

function defaultDomElementGetter(name) {
  return function getDefaultDomElement() {
    const id = `single-spa-application:${name}`;
    let domElement = document.getElementById(id);
    if (!domElement) {
      domElement = document.createElement('div');
      domElement.id = id;
      document.body.appendChild(domElement);
    }

    return domElement;
  }
}

type SingleSpaAngularOpts = {
  NgZone: any;
  bootstrapFunction(props: AppProps): Promise<any>;
  updateFunction?(props: AppProps): Promise<any>;
  template: string;
  Router?: any;
  domElementGetter?(): HTMLElement;
  AnimationEngine?: any;
}
