import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'chat-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const currentNavigation = router.getCurrentNavigation();
        console.log('chat currentNavigation.trigger = ', currentNavigation.trigger);
      }
    });
  }

  goToChatGroups(): void {
    this.router.navigateByUrl('/groups');
  }
}
