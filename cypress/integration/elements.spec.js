/// <reference types="cypress" />

describe('Custom element application', () => {
  it('should navigate to /elements and render the list of users', () => {
    cy.fixture('users').then(users => {
      cy.server();
      cy.route({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
        response: users,
      });

      cy.visit('/').visit('/elements').get('.columns .column').its('length').should('eq', 10);

      cy.go('back').get('.columns').should('not.exist');
    });
  });
});
