import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'navbar-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const currentNavigation = router.getCurrentNavigation();
        console.log('navbar currentNavigation.trigger = ', currentNavigation.trigger);
      }
    });
  }
}
