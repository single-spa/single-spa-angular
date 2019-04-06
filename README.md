# single-spa-angular
Helpers for building [single-spa](https://github.com/CanopyTax/single-spa) applications which use Angular.

## Example
See https://github.com/joeldenning/coexisting-angular-microfrontends.

## Angular CLI
### Installation
If you're using the Angular CLI, use the Angular Schematic to quickly upgrade your application to single-spa.

In the root of your Angular CLI application run the following:
```sh
ng add single-spa-angular@beta
```
The schematic performs the following tasks:
* Install single-spa-angular.
* Create a new entry in the project's architect called `single-spa`, which is a preconfigured [Angular Builder](#Angular-Builder).
* Generate a `main.single-spa.ts` in your project's `/src`.
* Add an npm script `npm run build:single-spa`.

### Check if it works

Now create a file **in the parent directory of your angular project** called `index.html` file in it. Your directory structure should look like this. Be sure to replace `nameOfAngularProject` with the actual name of your project.
```
index.html
nameOfAngularProject/
--> dist/
----> nameOfAngularProject/
------> main.js
--> package.json
--> angular.json
--> src/
```

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Angular test</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="/" />
</head>
<body>
  <script src="https://unpkg.com/zone.js"></script>
  <script src="https://unpkg.com/single-spa/lib/umd/single-spa.min.js"></script>
  <script src="/nameOfAngularProject/dist/nameOfAngularProject/main.js"></script>
  <script>
    singleSpa.registerApplication('nameOfAngularProject', window.nameOfAngularProject.default, location => true);
    singleSpa.start();
  </script>
</body>
</html>
```

Finally, run the following command from inside of the application directory:
```sh
ng serve --open
```

Congrats! Now you've got your angular-cli application running as a single-spa application. Now you can add more Angular, React, or Vue applications to your
root config's html file so that you have multiple microfrontends coexisting within a single page.

### Building
You can run `ng build --prod`, which will create a `dist` directory with your compiled code.

## Manual Install
In root of the application run:
```bash
npm install --save single-spa-angular
```

Then create `main.single-spa.ts` with the following content:
```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ApplicationRef } from '@angular/core';
import singleSpaAngular from 'single-spa-angular';
import { Router } from '@angular/router';
import { AppModule } From './app/app.module';

export default singleSpaAngular({
  bootstrapFunction: () => platformBrowserDynamic().bootstrapModule(AppModule),
  domElementGetter,
  template: `<component-to-render />`,
  Router,
  ApplicationRef,
})

function domElementGetter() {
  let containerEl = document.getElementById('my-app');
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = 'my-app';
    document.body.appendChild(containerEl);
  }

  return containerEl;
}
```

## single-spa-angular options

Options are passed to single-spa-angular via the `opts` parameter when calling `singleSpaAngular(opts)`. This happens inside of your `main.single-spa.ts` file.

The following options are available:

- `bootstrapFunction`: (required) A function that returns a promise that resolves with a resolved Angular module that is bootstrapped. Usually, your implementation will look like this: `bootstrapFunction: () => platformBrowserDynamic().bootstrapModule()`.
- `template`: (required) An html string that will be put into the DOM Element returned by `domElementGetter`. This template can be anything, but it is recommended that you keeping it simple by making it only one Angular component. For example, `<my-component />` is recommended, but `<div><my-component /><span>Hello</span><another-component /></div>` is allowed. Note that `innerHTML` is used to put the template onto the DOM.
- `Router`: (optional) The angular router class. This is required when you are using `@angular/router` and must be used in conjunction with the `ApplicationRef` option.
- `ApplicationRef`: (optional) The angular application ref interface. This is required when you are using `@angular/router` and must be used in conjunction with the `Router` option.
- `domElementGetter`: (optional) A function that takes in no arguments and returns a DOMElement. This dom element is where the Angular application will be bootstrapped, mounted, and unmounted.
    Note that this opt can only be omitted when domElementGetter is passed in as a [custom prop](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#custom-props). So you must either
    do `singleSpaReact({..., domElementGetter: function() {return ...}})` or do `singleSpa.registerApplication(name, app, activityFn, {domElementGetter: function() {...}})`

## Other notes
- If you have multiple angular child applications, make sure that `reflect-metadata` is only imported once in the root application and is not imported again in the child applications. Otherwise, you might see an `No NgModule metadata found` error. See [issue thread](https://github.com/CanopyTax/single-spa-angular/issues/2#issuecomment-347864894) for more details.
- Note that you should only have one version of ZoneJS, even if you have multiple versions of Angular.

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
          "serveDirectory": "../"
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
| serveDirectory | (optional) A relative path to the directory where your index.html file is (single-spa root config) | `"../"`
| singleSpaWebpackConfigPath | (optional) Path to partial webpack config to be merged with angular's config. Example: `extra-webpack.config.js` | undefined |

#### Contributing
For instructions on how to test this locally before creating a pull request, see the [Contributing guidelines](/CONTRIBUTING/md).