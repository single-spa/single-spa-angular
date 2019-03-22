To test out the angular schematics locally, run the following commands:

```sh
# First, fork the single-spa-angular repo and clone it.
# Then run the following commands inside of the single-spa-angular directory.
npm install
npm run build
npm link

# Now navigate to a new directory where we'll create an angular application to test this with
cd ..

## Now create an angular app
ng new

## Now install single-spa-angular from local file instead of npm, including running the schematics
npm link single-spa-angular
ng g single-spa-angular:ng-add
# Relink single-spa-angular (yes, it's necessary)
npm link single-spa-angular

## Now try things out!
ng build
ng serve
```