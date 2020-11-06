/// <reference types="cypress" />

describe('Angular parcel', () => {
  it('should navigate to /parcel and render the React widget and lazy component', () => {
    cy.visit('/parcel')
      // GitHub Actions CI is not as fast as the local setup, there can be some network delays,
      // timeout is used only for this purpose.
      .get('parcel-root parcel', { timeout: 5000 })
      .should('exist')
      .get('parcel-root parcel img')
      .invoke('attr', 'alt')
      .should('eq', 'React logo');
  });
});
