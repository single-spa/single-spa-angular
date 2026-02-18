import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, shareReplay } from 'rxjs';
import { ParcelModule } from 'single-spa-angular/parcel';

import { config } from './ReactWidget/ReactWidget';

const singleSpa$ = defer(() => System.import('single-spa')).pipe(
  shareReplay({ bufferSize: 1, refCount: true }),
);

@Component({
  selector: 'parcel-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParcelModule],
})
export class AppComponent {
  config = config;
  readonly mountRootParcel = signal<typeof import('single-spa').mountRootParcel | null>(null);
  customProps = {
    hello: 'Hola',
  };

  constructor() {
    singleSpa$.pipe(takeUntilDestroyed()).subscribe(({ mountRootParcel }) => {
      this.mountRootParcel.set(mountRootParcel);
    });
  }
}
