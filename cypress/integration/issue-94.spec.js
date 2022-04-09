/// <reference types="cypress" />

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
});

describe('https://github.com/single-spa/single-spa-angular/issues/94', () => {
  it('should navigate using back button and change detection should continue working', () => {
    cy.visit('/shop');

    cy.get('button').click();

    // On the first load when we click the button Angular will run
    // change detection and we will see that input.
    cy.get('input[type=search]').should('exist');

    // Let's navigate by click `a` that will schedule navigation
    // inside the Angular's zone.
    cy.get('shop-root a').first().click();

    // Ensure we're on the next page.
    cy.url().should('contain', '/shop/transmission/1');

    // Let's go back using `history.back()` that will run `history.replaceState`
    // outside of the Angular's zone.
    cy.go('back');

    // Let's click the button again.
    cy.get('button').click();

    // And ensure that element IS projected because change detection is working.
    cy.get('input[type=search]').should('exist');
  });
});
