import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'navbar-primary-nav',
  templateUrl: './primary-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimaryNavComponent {
  links = [
    {
      label: 'Shop',
      url: '/shop',
    },
    {
      label: 'Chat',
      url: '/chat',
    },
    {
      label: 'Noop zone application',
      url: '/noop-zone',
    },
    {
      label: 'Custom element',
      url: '/elements',
    },
    {
      label: 'Angular parcel',
      url: '/parcel',
    },
    {
      label: 'Angular standalone',
      url: '/standalone',
    },
  ];

  constructor(private router: Router) {}

  route(url: string): void {
    this.router.navigateByUrl(url);
  }
}
