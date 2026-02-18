import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/transmissions/transmissions.component').then(m => m.TransmissionsComponent),
  },
  {
    path: 'transmission/:id',
    loadComponent: () =>
      import('./pages/transmission-details/transmission-details.component').then(
        m => m.TransmissionDetailsComponent,
      ),
  },
];
