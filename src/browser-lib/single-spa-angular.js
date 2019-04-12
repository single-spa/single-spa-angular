"use strict";
/* eslint-disable @typescript-eslint/no-use-before-define */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var defaultOpts = {
    // required opts
    bootstrapFunction: null,
    template: null,
    // optional opts
    Router: null,
    domElementGetter: null
};
function singleSpaAngular(userOpts) {
    if (typeof userOpts !== "object") {
        throw Error("single-spa-angular requires a configuration object");
    }
    var opts = __assign({}, defaultOpts, userOpts);
    if (typeof opts.bootstrapFunction !== 'function') {
        throw Error("single-spa-angular must be passed an opts.bootstrapFunction");
    }
    if (typeof opts.template !== "string") {
        throw Error("single-spa-angular must be passed opts.template string");
    }
    if (!opts.NgZone) {
        throw Error("single-spa-angular must be passed the NgZone opt");
    }
    return {
        bootstrap: bootstrap.bind(null, opts),
        mount: mount.bind(null, opts),
        unmount: unmount.bind(null, opts)
    };
}
exports["default"] = singleSpaAngular;
function bootstrap(opts, props) {
    return Promise.resolve().then(function () {
        // In order for multiple Angular apps to work concurrently on a page, they each need a unique identifier.
        opts.zoneIdentifier = "single-spa-angular:" + (props.name || props.appName);
        // This is a hack, since NgZone doesn't allow you to configure the property that identifies your zone.
        // See https://github.com/PlaceMe-SAS/single-spa-angular-cli/issues/33,
        // https://github.com/CanopyTax/single-spa-angular/issues/47,
        // https://github.com/angular/angular/blob/a14dc2d7a4821a19f20a9547053a5734798f541e/packages/core/src/zone/ng_zone.ts#L144,
        // and https://github.com/angular/angular/blob/a14dc2d7a4821a19f20a9547053a5734798f541e/packages/core/src/zone/ng_zone.ts#L257
        opts.NgZone.isInAngularZone = function () {
            // @ts-ignore
            return window.Zone.current.get(opts.zoneIdentifier) === 'true';
        };
    });
}
function mount(opts, props) {
    return Promise
        .resolve()
        .then(function () {
        var domElementGetter = chooseDomElementGetter(opts, props);
        if (!domElementGetter) {
            throw Error("cannot mount angular application '" + (props.name || props.appName) + "' without a domElementGetter provided either as an opt or a prop");
        }
        var containerEl = getContainerEl(domElementGetter);
        containerEl.innerHTML = opts.template;
    })
        .then(function () {
        var bootstrapPromise = opts.bootstrapFunction();
        if (!(bootstrapPromise instanceof Promise)) {
            throw Error("single-spa-angular: the opts.bootstrapFunction must return a promise, but instead returned a '" + typeof bootstrapPromise + "' that is not a Promise");
        }
        return bootstrapPromise.then(function (module) {
            if (!module || typeof module.destroy !== 'function') {
                throw Error("single-spa-angular: the opts.bootstrapFunction returned a promise that did not resolve with a valid Angular module. Did you call platformBrowser().bootstrapModuleFactory() correctly?");
            }
            module.injector.get(opts.NgZone)._inner._properties[opts.zoneIdentifier] = true;
            opts.bootstrappedModule = module;
            return module;
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function unmount(opts, props) {
    return Promise.resolve().then(function () {
        if (opts.Router) {
            // Workaround for https://github.com/angular/angular/issues/19079
            var routerRef = opts.bootstrappedModule.injector.get(opts.Router);
            routerRef.dispose();
        }
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
            var animationEngine = opts.bootstrappedModule.injector.get(opts.AnimationEngine);
            animationEngine._transitionEngine.flush();
        }
        delete opts.bootstrappedModule;
    });
}
function getContainerEl(domElementGetter) {
    var element = domElementGetter();
    if (!element) {
        throw Error("domElementGetter did not return a valid dom element");
    }
    return element;
}
function chooseDomElementGetter(opts, props) {
    if (props && props.customProps && props.customProps.domElementGetter) {
        return props.customProps.domElementGetter;
    }
    else if (opts.domElementGetter) {
        return opts.domElementGetter;
    }
    else {
        return defaultDomElementGetter(props.name);
    }
}
function defaultDomElementGetter(name) {
    return function getDefaultDomElement() {
        var id = "single-spa-application:" + name;
        var domElement = document.getElementById(id);
        if (!domElement) {
            domElement = document.createElement('div');
            domElement.id = id;
            document.body.appendChild(domElement);
        }
        return domElement;
    };
}
