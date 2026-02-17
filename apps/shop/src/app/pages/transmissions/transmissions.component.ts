import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'shop-transmissions',
  templateUrl: './transmissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
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

  readonly searchBarShown = signal(false);

  showSearchBar(): void {
    this.searchBarShown.set(true);
  }
}
