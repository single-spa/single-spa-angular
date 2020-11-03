import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'chat-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private router: Router) {}

  goToChatGroups(): void {
    this.router.navigateByUrl('/groups');
  }
}
