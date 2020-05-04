import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'noop-zone-root',
  templateUrl: './app.component.html',
  styles: [
    `
      button {
        margin: 10px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(public router: Router) {}
}
