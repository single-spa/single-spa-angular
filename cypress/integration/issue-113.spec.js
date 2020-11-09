/// <reference types="cypress" />

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
});

describe('https://github.com/single-spa/single-spa-angular/issues/113', () => {
  it('should navigate from /chat/groups to /chat/rooms and back to /chat/groups and SHOULD NOT stuck in infinite redirects loop', () => {
    cy.visit('/chat/groups').then(() => {
      const urls = [];

      // Start listening this event after navigating to `/chat/groups`.
      cy.on('url:changed', url => {
        urls.push(url);
      });

      // By clicking this button we invoke the following code:
      // `router.navigateByUrl('/rooms').then(() => router.navigateByUrl('/groups'))`.
      cy.get('button.try-to-reproduce-113-issue')
        .click()
        // The `wait` command is used because Cypress on the CI level is slower than locally,
        // basically it clicks the `<button>` and does assertion immediately, but `single-spa`
        // hasn't loaded the `/chat/groups` chunk yet.
        .wait(Cypress.env('timeout'))
        .then(() => {
          // We have navigated 2 times: to `/rooms` and back to `/groups`.
          // Let's ensure that the queue was flushed and it's not stuck.
          expect(urls.length).to.equal(2);

          // We just skip `location.origin` since it's not accessible by Cypress.
          expect(urls[0]).to.contain('/chat/rooms');
          expect(urls[1]).to.contain('/chat/groups');

          // Ensure Chrome didn't throttle navigation and we're able to navigate again.
          cy.visit('/shop');

          // GitHub Actions CI is not as fast as the local setup, there can be some network delays,
          // timeout is used only for this purpose.
          cy.get('shop-root', { timeout: Cypress.env('timeout') }).should('exist');
        });
    });
  });

  it('should navigate to /chat/groups and cleanup event listeners, then to /shop and back again, and ensure that event listeners are not added twice', () => {
    cy.visit('/chat/groups')
      .visit('/shop')
      .go('back')
      .then(() => {
        const urls = [];

        // Start listening this event after navigating back.
        cy.on('url:changed', url => {
          urls.push(url);
        });

        cy.get('button.try-to-reproduce-113-issue', { timeout: Cypress.env('timeout') })
          .click()
          .then(() => {
            // We have navigated 2 times: to `/rooms` and back to `/groups`.
            // Let's ensure that the queue was flushed and it's not stuck.
            expect(urls.length).to.equal(2);

            // We just skip `location.origin` since it's not accessible by Cypress.
            expect(urls[0]).to.contain('/chat/rooms');
            expect(urls[1]).to.contain('/chat/groups');
          });
      });
  });
});
