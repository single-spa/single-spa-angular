import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'shop-transmissions',
  templateUrl: './transmissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransmissionsComponent {
  transmissions = [
    {
      id: 1,
      label: 'First transmission :)',
    },
    {
      id: 2,
      label: 'Second transmission :)',
    },
  ];

  searchBarShown = false;

  showSearchBar(): void {
    this.searchBarShown = true;
  }
}
