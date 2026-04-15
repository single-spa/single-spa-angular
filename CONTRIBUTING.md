# Contributing to single-spa-angular

Before doing any changes to the codebase you have to fork single-spa-angular repo and clone it. The next step is to install the dependencies inside of the single-spa-angular directory:

```sh
# Prepare for some noise, there is the `postinstall` script that runs `ngcc` compiler.
yarn
```

Any changes to the codebase must be tested. We've got different applications inside the `apps` folder in which we make sure that the issues reported earlier are not reproduced. You can serve all of them in the development mode simultaneously by running the following command:

```sh
yarn serve:all
```

After that, you can make sure that all applications are running by going to the `http://localhost:8080`.

If you fix a bug or add a feature, then you need to add integration tests as well, we use Cypress for that. There is a `cypress/integration` folder where we keep our integration tests. You can look at how other integration tests are implemented and create new tests following their example.

When you have written a new test, you need to run it. You can do that by running the following command:

```sh
yarn cy:run
```

This will open the Cypress GUI and you can select the file in which to run the tests. Note that applications should also be running, so do it in different terminals.

To run the final tests, you need to build all applications in production mode and run the Cypress again. This can be done by running the below commands:

```sh
yarn build:all
yarn test:ci:integration
```

### Schematics

To test out the angular schematics locally, run the following commands:

```sh
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

# Publishing

1. Modify `libs/single-spa-angular/package.json` to have the new `"version"`
2. Terminal commands

```sh
yarn build
cd lib
yarn publish # do not change the version - it already has correct version from step 1
cd ..
git add .
git commit -m "v1.2.5" # replace 1.2.5 with the newly published version
git tag -a v1.2.5 -m v.1.2.5 # replace 1.2.5 with the newly published version
git push
```

3. Create Github release
