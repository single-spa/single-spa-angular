/// <reference types="cypress" />

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
});

describe('Zone-less application', () => {
  it('should mount zone-less application, navigate between pages and then unmount it successfully', () => {
    cy.visit('/noop-zone');

    cy.get('noop-zone-home h3').should('contain.text', 'Welcome to noop zone application home!');

    // Click `Go to /images`, verify that URL has been changed,
    // verify that previous view has been destroyed.
    cy.get('noop-zone-root button.go-to-images')
      .click()
      .url()
      .should('contain', '/noop-zone/images')
      .get('noop-zone-home')
      .should('not.exist');

    // Click `Show images` button and verify
    // that all images are shown.
    cy.get('noop-zone-images button')
      .click()
      .get('noop-zone-images figure')
      .its('length')
      .should('eq', 5);

    // Go back using `history.back()`
    cy.go('back');

    // Ensure that views are destroyed and created successfully.
    cy.get('noop-zone-images').should('not.exist').get('noop-zone-home').should('exist');

    // Ensure that app was unmounted successfully
    cy.visit('/chat').get('noop-zone-root').should('not.exist');
  });
});
