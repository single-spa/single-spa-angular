import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'shop-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AppComponent {}
