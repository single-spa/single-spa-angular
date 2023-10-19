import { Component, ChangeDetectionStrategy, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'shop-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  @ViewChild('sharedLibraryContainer', { static: true, read: ViewContainerRef })
  sharedLibraryContainer!: ViewContainerRef;

  constructor() {
    System.import('shared-library').then(m => {
      const { changeDetectorRef } = this.sharedLibraryContainer.createComponent(
        m.SharedLibraryComponent,
      );
      changeDetectorRef.detectChanges();
    });
  }
}
