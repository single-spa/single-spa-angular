# single-spa-angular
Helpers for building [single-spa](https://github.com/CanopyTax/single-spa) applications which use Angular.

[Join the #angular channel in single-spa's slack workspace](https://join.slack.com/t/single-spa/shared_invite/enQtMzIwMTcxNTU3ODQyLTM1Y2U1OWMzNTNjOWYyZDBlMDJhN2VkYzk3MDI2NzQ2Nzg0MzMzNjVhNWE2YjVhMTcxNjFkOWYzMjllMmUxMjk)

## Example
See https://github.com/joeldenning/coexisting-angular-microfrontends.

## Angular CLI
### Installation
First, create an angular application. This requires installing [angular cli](https://cli.angular.io/).
```sh
ng new my-app --routing --defaults --prefix my-app
cd my-app
```

In the root of your Angular CLI application run the following:
```sh
ng add single-spa-angular@beta
```
The schematic performs the following tasks:
* Install single-spa-angular.
* Create a new entry in the project's architect called `single-spa`, which is a preconfigured [Angular Builder](#Angular-Builder).
* Generate a `main.single-spa.ts` in your project `src/`.
* Generate `single-spa-props.ts` in `src/single-spa/`
* Generate `asset-url.ts` in `src/single-spa/`
* Generate an EmptyRouteComponent in `src/app/empty-route/`, to be used in app-routing.module.ts.
* Add an npm script `npm run build:single-spa`.

### Add a route
If you're doing routing within your angular application, do the following:

1. Add `providers: [{ provide: APP_BASE_HREF, useValue: '/' }]` to `app-routing.module.ts`. See https://angular.io/api/common/APP_BASE_HREF for more details.
2. Add `{ path: '**', component: EmptyRouteComponent }` to your `app-routing.module.ts` routes. See https://angular.io/guide/router#configuration for more details.
3. Add a declaration for EmptyRouteComponent in `app.module.ts`. See https://angular.io/guide/ngmodules#the-basic-ngmodule.

### Configuring multiple apps
When you have multiple apps running side by side, you'll need to make sure that their
[component selectors](https://angular.io/api/core/Directive#selector) are unique. When creating a new
project, you can have angular-cli do this for you by passing in the `--prefix` option:

```sh
ng new --prefix app2
```

If you did not use the `--prefix` option, you should set the prefix manually:

1. For an application called app2, add `"prefix": "app2"` to `projects.app2` inside of the angular.json.
2. Go to `app.component.ts`. Modify `selector` to be `app2-root`.
3. Go to `main.single-spa.ts`. Modify `template` to be `<app2-root>`.

### Check if it works
Run the following:

```sh
npm run serve:single-spa
```

This **will not** open up an html file, since single-spa applications all share one html file. Instead, go to
http://single-spa-playground.org and follow the instructions there to verify everything is working and for instructions on creating the shared html file.

### Building
You can run `ng build --prod`, which will create a `dist` directory with your compiled code.

## Manual Install
If you are not using Angular CLI, do the following:
```bash
npm install --save single-spa-angular
```

Then create `main.single-spa.ts` with the following content:
```js
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgZone } from '@angular/core';
import singleSpaAngular from 'single-spa-angular';
import { Router } from '@angular/router';
import { AppModule } From './app/app.module';

const lifecycles = singleSpaAngular({
  bootstrapFunction: (customProps) => platformBrowserDynamic().bootstrapModule(AppModule),
  template: `<component-to-render />`,
  Router,
  NgZone,
})

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
```

## Custom Props
[Custom props](https://single-spa.js.org/docs/building-applications.html#custom-props) are a way of passing auth or other data to your single-spa applications. The custom props are available inside of the bootstrapFunction explained below. Additionally, if you use the angular cli schematic,
you may subscribe to the singleSpaPropsSubject in your component, as shown below:

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { singleSpaPropsSubject, SingleSpaProps } from 'src/single-spa/single-spa-props';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  singleSpaProps: SingleSpaProps = null;
  subscription: Subscription = null;
  ngOnInit() {
    this.subscription = singleSpaPropsSubject.subscribe(
      props => this.singleSpaProps = props
    )
  }
  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
}

```

## Angular assets
[Angular assets](https://angular.io/guide/file-structure#application-source-files) must be handled differently within single-spa. If you
use the single-spa-angular schematics, there is a file called `asset-url.ts` to help you out with this. Feel free to create an injectable
Angular Pipe for the asset url for usage within html templates.

```js
// Doesn't work with single-spa
const urlToImageAsset = '/assets/file.png'
```

```js
import { assetUrl } from 'src/single-spa/asset-url';

// Works great with single-spa
const urlToImageAsset = assetUrl('file.png')
```

## single-spa-angular options

Options are passed to single-spa-angular via the `opts` parameter when calling `singleSpaAngular(opts)`. This happens inside of your `main.single-spa.ts` file.

The following options are available:

- `bootstrapFunction`: (required) A function that is given custom props as an argument and returns a promise that resolves with a resolved Angular module that is bootstrapped. Usually, your implementation will look like this: `bootstrapFunction: (customProps) => platformBrowserDynamic().bootstrapModule()`.
  See [custom props documentation](https://single-spa.js.org/docs/building-applications.html#custom-props) for more info on the argument passed to the function.
- `template`: (required) An html string that will be put into the DOM Element returned by `domElementGetter`. This template can be anything, but it is recommended that you keeping it simple by making it only one Angular component. For example, `<my-component />` is recommended, but `<div><my-component /><span>Hello</span><another-component /></div>` is allowed. Note that `innerHTML` is used to put the template onto the DOM. Also note that when using multiple angular applications simultaneously, you will want to make sure that the component selectors provided are unique to avoid collisions.
- `Router`: (optional) The angular router class. This is required when you are using `@angular/router`.
- `AnimationModule`: (optional) The animation module class. This is required when you are using BrowserAnimationsModule.
  Example way to import this: `import { eAnimationEngine as AnimationModule } from '@angular/animations/browser';`.
  See [Issue 48](https://github.com/CanopyTax/single-spa-angular/issues/48) for more details.
- `domElementGetter`: (optional) A function that takes in no arguments and returns a DOMElement. This dom element is where the Angular application will be bootstrapped, mounted, and unmounted.
    Note that this opt can only be omitted when domElementGetter is passed in as a [custom prop](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#custom-props). So you must either
    do `singleSpaReact({..., domElementGetter: function() {return ...}})` or do `singleSpa.registerApplication(name, app, activityFn, {domElementGetter: function() {...}})`

## Other notes
- If you have multiple angular child applications, make sure that `reflect-metadata` is only imported once in the root application and is not imported again in the child applications. Otherwise, you might see an `No NgModule metadata found` error. See [issue thread](https://github.com/CanopyTax/single-spa-angular/issues/2#issuecomment-347864894) for more details.
- Note that you should only have one version of ZoneJS, even if you have multiple versions of Angular.
- Make sure that the root component selectors for each of your angular applications are unique so that angular can differentiate them. The default selector for an angular cli application is `app-root`. You will need to update these selectors to be unique in your child application's `app.component.ts`, as well as in the singleSpaAngular template option found in `main.single-spa.ts`. To catch other references (such as in test files) try a project wide find and replace for `app-root`.  

## Angular Builder
To aid in building your applications a builder is available to generate a module for single-spa to consume.
**NOTE: If you installed this library using the Angular Schematic, this is already configured.**

### Usage
To build your Angular CLI application as a single-spa app do the following.

* Open `angular.json`
* Locate the project you wish to update.
* Navigate to the `architect > build` property.
* Set the `builder` property to `single-spa-angular:build`.
* Run `ng build` and verify your dist contains one asset, `main.js`.

Example Configuration:
```json
{
  "architect": {
      "build": {
        "builder": "single-spa-angular:build",
        "options": {
          "libraryName": "hello",
        }
      },
      "serve": {
        "builder": "single-spa-angular:dev-server",
        "options": {
        }
      }
  }
}
```
#### ng build options
Configuration options are provided to the `architect.build.options` section of your angular.json. 

| Name | Description | Default Value |
| ---- | ----------- | ------------- |
| libraryName | (optional) Specify the name of the module | Angular CLI project name |
| libraryTarget | (optional) The type of library to build [see available options](https://github.com/webpack/webpack/blob/master/declarations/WebpackOptions.d.ts#L1111) | "UMD" |
| singleSpaWebpackConfigPath | (optional) Path to partial webpack config to be merged with angular's config. Example: `extra-webpack.config.js` | undefined |

#### ng serve options
Configuration options are provided to the `architect.serve.options` section of your angular.json. 

| Name | Description | Default Value |
| ---- | ----------- | ------------- |
| singleSpaWebpackConfigPath | (optional) Path to partial webpack config to be merged with angular's config. Example: `extra-webpack.config.js` | undefined |

#### Contributing
For instructions on how to test this locally before creating a pull request, see the [Contributing guidelines](/CONTRIBUTING/md).
