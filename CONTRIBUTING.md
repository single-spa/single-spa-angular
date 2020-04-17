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

## Now install single-spa-angular from local file instead of npm, including running the schematics
yarn link single-spa-angular
ng g single-spa-angular:ng-add
# Relink single-spa-angular (yes, it's necessary)
yarn link single-spa-angular

## Now try things out!
yarn build
yarn start
```
