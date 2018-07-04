# single-spa-angular
Helpers for building [single-spa](https://github.com/CanopyTax/single-spa) applications which use Angular. Note that this project works with Angular 2, 3, 4, 5+, despite its name.

## Alternative
This project is great for people who use Angular without angular-cli. But if that's not you, try out [single-spa-angular-cli](https://github.com/PlaceMe-SAS/single-spa-angular-cli).

## Example
An example can be found in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples/blob/master/src/angular/angular.app.js) repository.

## Quickstart
First, in the [single-spa application](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#registered-applications), run `npm install --save single-spa-angular`. Then, create an entry file for application:

```js
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import singleSpaAngular from 'single-spa-angular';
import mainModule from './main-module.ts';
import {Router} from '@angular/router';

const ngLifecycles = singleSpaAngular({
	domElementGetter,
	mainModule,
	angularPlatform: platformBrowserDynamic(),
	template: `<component-to-render />`,
	Router,
})

export const bootstrap = [
	ngLifecycles.bootstrap,
];

export const mount = [
	ngLifecycles.mount,
];

export const unmount = [
	ngLifecycles.unmount,
];

function domElementGetter() {
	return document.getElementById('angular');
}
```

## Options

All options are passed to single-spa-angular via the `opts` parameter when calling `singleSpaAngular(opts)`. The following options are available:

- `mainModule`: (required) An Angular module class. If you're using Typescript or ES6 decorators, this is a class with the @NgModule decorator on it.
- `angularPlatform`: (required) The platform with which to bootstrap your module. The "Angular platform" refers to whether the code is running on the browser, mobile, server, etc. In the case of a single-spa application, you should use the `platformBrowserDynamic` platform.
- `template`: (required) An html string that will be put into the DOM Element returned by `domElementGetter`. This template can be anything, but it is recommended that you keeping it simple by making it only one Angular component. For example, `<my-component />` is recommended, but `<div><my-component /><span>Hello</span><another-component /></div>` is allowed. Note that `innerHTML` is used to put the template onto the DOM.
- `Router`: (optional) The angular router class. If not provided, single-spa-angular will assume you are not using @angular/router.
- `domElementGetter`: (optional) A function that takes in no arguments and returns a DOMElement. This dom element is where the Angular application will be bootstrapped, mounted, and unmounted.
    Note that this opt can only be omitted when domElementGetter is passed in as a [custom prop](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#custom-props). So you must either
    do `singleSpaReact({..., domElementGetter: function() {return ...}})` or do `singleSpa.registerApplication(name, app, activityFn, {domElementGetter: function() {...}})`

## Other notes
- If you have multiple angular child applications, make sure that `reflect-metadata` is only imported once in the root application and is not imported again in the child applications. Otherwise, you might see an `No NgModule metadata found` error. See [issue thread](https://github.com/CanopyTax/single-spa-angular/issues/2#issuecomment-347864894) for more details.
- NOte that you should only have one version of ZoneJS, even if you have multiple versions of Angular.
