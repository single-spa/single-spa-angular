import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'noop-zone-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {}
