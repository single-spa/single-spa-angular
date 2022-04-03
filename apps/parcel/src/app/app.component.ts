import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { defer, shareReplay, Subject, takeUntil } from 'rxjs';

import { config } from './ReactWidget/ReactWidget';

const singleSpa$ = defer(() => System.import('single-spa')).pipe(
  shareReplay({ bufferSize: 1, refCount: true }),
);

@Component({
  selector: 'parcel-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  config = config;
  mountRootParcel: typeof import('single-spa').mountRootParcel | null = null;
  customProps = {
    hello: 'Hola',
  };

  private destroy$ = new Subject<void>();

  constructor(private ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    singleSpa$.pipe(takeUntil(this.destroy$)).subscribe(({ mountRootParcel }) => {
      this.mountRootParcel = mountRootParcel;
      this.ref.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
