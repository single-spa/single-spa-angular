# single-spa-angular2
Helpers for building [single-spa](https://github.com/CanopyTax/single-spa) applications which use Angular 2.

## Example
An example can be found in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples/blob/master/src/angular2/angular2.app.js) repository.

## Quickstart

First, in the child application, run `npm install --save single-spa-angular2` (or `jspm install npm:single-spa-angular2` if your child application is managed by jspm). Then, in your [child app's entry file](https://github.com/CanopyTax/single-spa/blob/docs-1/docs/configuring-child-applications.md#the-entry-file), do the following:

```js
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import singleSpaAngular2 from 'single-spa-angular2';
import mainModule from './main-module.ts';

const ng2Lifecycles = singleSpaAngular2({
	domElementGetter,
	mainModule,
	angularPlatform: platformBrowserDynamic(),
	template: `<component-to-render />`,
})

export const bootstrap = [
	ng2Lifecycles.bootstrap,
];

export const mount = [
	ng2Lifecycles.mount,
];

export const unmount = [
	ng2Lifecycles.unmount,
];

function domElementGetter() {
	return document.getElementById('angular2');
}
```

## Options

All options are passed to single-spa-angular2 via the `opts` parameter when calling `singleSpaAngular2(opts)`. The following options are available:

- `domElementGetter`: (required) A function that takes in no arguments and returns a DOMElement. This dom element is where the angular application will be bootstrapped, mounted, and unmounted.
- `mainModule`: (required) An Angular 2 module class. If you're using Typescript or ES6 decorators, this is a class with the @NgModule decorator on it.
- `angularPlatform`: (required) The platform with which to bootstrap your module. The "Angular platform" refers to whether the code is running on the browser, mobile, server, etc. In the case of a single-spa application, you should use the `platformBrowserDynamic` platform.
- `template`: (required) An html string that will be put into the DOM Element returned by `domElementGetter`. This template can be anything, but it is recommended that you keeping it simple by making it only one Angular component. For example, `<my-component />` is recommended, but `<div><my-component /><span>Hello</span><another-component /></div>` is allowed. Note that `innerHTML` is used to put the template onto the DOM.
