import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'navbar-primary-nav',
  templateUrl: './primary-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimaryNavComponent {
  constructor(private router: Router) {}

  route(url: string): void {
    this.router.navigateByUrl(url);
  }
}
