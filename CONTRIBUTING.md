To test out the angular schematics locally, run the following commands:

```sh
# First, fork the single-spa-angular repo and clone it.
# Then run the following commands inside of the single-spa-angular directory.
yarn install
yarn build

## Now link the built files
cd lib
yarn link

# Now navigate to a new directory where we'll create an angular application to test this with
cd ../..

## Now create an angular app
ng new

## This project uses yarn, so it's easiest to use yarn in your example project, too
yarn install

yarn link single-spa-angular

## Run the schematics
ng g single-spa-angular:ng-add

## Install dependencies
yarn add single-spa
yarn add file:../single-spa-angular/lib

## Now try things out!
yarn build
yarn start
```
