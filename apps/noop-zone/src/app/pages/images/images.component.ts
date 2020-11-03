import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'noop-zone-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagesComponent {
  images = Array.from({ length: 5 });

  imagesShown = false;

  constructor(private ref: ChangeDetectorRef) {}

  showImages(): void {
    this.imagesShown = true;
    this.ref.detectChanges();
  }
}
