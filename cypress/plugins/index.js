/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
  const isCI = process.env.CI === 'true';

  // The Cypress on the CI level is slower than locally,
  // basically it does assertions immediately, but the `single-spa`
  // hasn't loaded microfrontend yet and the logic hasn't been executed.
  // `3000` (3 seconds) is a subjectively chosen timeout, since it should be
  // enough for the CI to handle all network requests.
  config.env.timeout = isCI ? 3000 : 0;
  return config;
};
