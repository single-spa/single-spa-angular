import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PrimaryNavComponent } from './components/primary-nav/primary-nav.component';

@Component({
  selector: 'navbar-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PrimaryNavComponent],
})
export class AppComponent {}
