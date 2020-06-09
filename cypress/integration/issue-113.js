/// <reference types="cypress" />

describe('https://github.com/single-spa/single-spa-angular/issues/113', () => {
  it('should navigate from /chat/groups to /chat/rooms and back to /chat/groups and SHOULD NOT stuck in infinite redirects loop', () => {
    let urlChangedTimes = 0;

    cy.visit('/chat/groups').then(() => {
      // Start listening this event after navigating to `/chat/groups`.
      cy.on('url:changed', () => {
        urlChangedTimes++;
      });
    });

    // By clicking this button we invoke the following code:
    // `router.navigateByUrl('/rooms').then(() => router.navigateByUrl('/groups'))`.
    cy.get('button.try-to-reproduce-113-issue')
      .click()
      .then(() => {
        // We have navigated 2 times: to `/rooms` and back to `/groups`.
        // Let's ensure that the queue was flushed and it's not stuck.
        expect(urlChangedTimes).to.eq(2);

        // Ensure Chrome didn't throttle navigation and we're able to navigate again.
        cy.visit('/shop');
        cy.get('shop-root').should('exist');
      });
  });

  it('should navigate to /chat/groups and cleanup event listeners, then to /shop and back again, and ensure that event listeners are not added twice', () => {
    let urlChangedTimes = 0;

    cy.visit('/chat/groups')
      .visit('/shop')
      .go('back')
      .then(() => {
        // Start listening this event after navigating back.
        cy.on('url:changed', () => {
          urlChangedTimes++;
        });
      });

    cy.get('button.try-to-reproduce-113-issue')
      .click()
      .then(() => {
        // We have navigated 2 times: to `/rooms` and back to `/groups`.
        // Let's ensure that the queue was flushed and it's not stuck.
        expect(urlChangedTimes).to.eq(2);
      });
  });
});
