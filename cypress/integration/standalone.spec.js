/// <reference types="cypress" />

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
});

describe('Angular parcel', () => {
  it('should navigate to /standalone and render the standalone application', () => {
    // We have to render any other application (non-standalone) to create platform injector.
    // `bootstrapApplication()` doesn't support passing platform providers for now.
    cy.visit('/parcel')
      // GitHub Actions CI is not as fast as the local setup, there can be some network delays,
      // timeout is used only for this purpose.
      .get('parcel-root parcel', { timeout: Cypress.env('timeout') })
      .should('exist')
      .visit('/standalone')
      .get('standalone-root standalone-home', { timeout: Cypress.env('timeout') })
      .should('contain.text', 'This is the home page of standalone application.');
  });
});
