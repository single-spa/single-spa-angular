import { ChangeDetectionStrategy, Component } from '@angular/core';
import { mountRootParcel } from 'single-spa';

import { config } from './ReactWidget/ReactWidget';

@Component({
  selector: 'parcel-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  config = config;
  mountRootParcel = mountRootParcel;
}
