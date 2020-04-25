/// <reference types="cypress" />

describe('https://github.com/single-spa/single-spa-angular/issues/113', () => {
  it('should navigate from /chat/groups to /chat/rooms and back to /chat/groups and SHOULD stuck in infinite redirects loop', () => {
    let urlChangedTimes = 0;

    cy.on('url:changed', () => {
      urlChangedTimes++;

      if (urlChangedTimes === 15) {
        // We actually wanted to navigate only 2 times to `/chat/rooms` and back to
        // `/chat/groups`, but seems like it's already 15 times O_O.

        // `setTimeout` is needed to do assertion after `throw`, since we can't
        // execute any code after `throw`.
        setTimeout(() => {
          expect(urlChangedTimes).to.equal(15);
        });

        // We throw error by stopping those infinite redirects.
        throw new Error('Seems like there are a lot of redirects...');
      }
    });

    cy.visit('/chat/groups');
    // By clicking this button we invoke the following code:
    // `router.navigateByUrl('/rooms').then(() => router.navigateByUrl('/groups'))`
    cy.get('button.reproduce-113-issue').click();
  });
});
