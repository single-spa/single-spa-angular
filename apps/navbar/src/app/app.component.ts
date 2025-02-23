import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'navbar-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AppComponent {}
