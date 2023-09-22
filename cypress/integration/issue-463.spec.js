/// <reference types="cypress" />

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
});

describe('https://github.com/single-spa/single-spa-angular/issues/463', () => {
  it('should apply a global style from the `apps/navbar/src/styles.scss`', () => {
    cy.visit('/');

    cy.get('.dark-red')
      .first()
      .then($el => $el.css('color'))
      .should(
        'equal',
        // #f14668
        'rgb(241, 70, 104)',
      );
  });
});
