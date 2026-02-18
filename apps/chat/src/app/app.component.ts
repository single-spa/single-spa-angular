import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'chat-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent {
  constructor(private router: Router) {}

  goToChatGroups(): void {
    this.router.navigateByUrl('/groups');
  }
}
