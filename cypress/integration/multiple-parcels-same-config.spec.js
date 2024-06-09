/// <reference types="cypress" />

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
});

describe('https://github.com/single-spa/single-spa-angular/issues/234', () => {
  it('should render the same Angular parcel twice', () => {
    cy.visit('/multiple-parcels-same-config')
      // Mount the first parcel.
      .get('button.mount1')
      .click()
      // The `wait` command is used because Cypress on the CI level is slower than locally,
      // basically it clicks the `<button>` and does assertion immediately, but `single-spa`
      // hasn't loaded the first parcel yet.
      .wait(Cypress.env('timeout'))
      .then(() => {
        cy.get('.parcel-same-config')
          .should('have.length', 1);
        
        // Mount the second parcel.
        cy.get('button.mount2')
          .click()
          .wait(Cypress.env('timeout'))
          .then(() => {
            cy.get('.parcel-same-config')
              .should('have.length', 2);
          });

        // Unmount the first parcel.
        cy.get('button.unmount1')
          .click()
          .wait(Cypress.env('timeout'))
          .then(() => {
            cy.get('.parcel-same-config')
              .should('have.length', 1);
          });

        // Unmount the second parcel.
        cy.get('button.unmount2')
          .click()
          .wait(Cypress.env('timeout'))
          .then(() => {
            cy.get('.parcel-same-config')
              .should('have.length', 0);
          });

      })
  });
});
