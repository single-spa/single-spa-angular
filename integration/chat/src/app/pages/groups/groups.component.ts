import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'chat-groups',
  templateUrl: './groups.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent {
  constructor(private router: Router) {}

  tryToReproduce113Issue(): void {
    this.router.navigateByUrl('/rooms').then(() => this.router.navigateByUrl('/groups'));
  }
}
