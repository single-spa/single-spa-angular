/// <reference types="cypress" />

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
});

describe('Custom element application', () => {
  it('should navigate to /elements and render the list of users', () => {
    cy.visit('/').visit('/elements').get('.columns .column').its('length').should('eq', 10);

    cy.go('back').get('.columns').should('not.exist');
  });

  describe('https://github.com/single-spa/single-spa-angular/issues/187', () => {
    it('should navigate to /elements, click the button to load lazy styles and should change the color', () => {
      cy.visit('/').visit('/elements');

      // By clicking this button we invoke the following code:
      // `System.import('/dark-theme.js')`.
      cy.get('button.try-to-reproduce-187-issue').click();

      // Ensure that styles have been loaded and the description has been shown.
      cy.get('p.lazy-styles-have-been-loaded', { timeout: Cypress.env('timeout') }).should('exist');

      // Ensure that styles have been applied to the `p.username`.
      cy.get('.users .username').should('have.css', 'color').and(
        'eq',
        // `rgb(255, 127, 80) = coral`.
        'rgb(255, 127, 80)',
      );
    });
  });
});
