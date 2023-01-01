import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/transmissions/transmissions.module').then(m => m.TransmissionsModule),
  },
  {
    path: 'transmission/:id',
    loadChildren: () =>
      import('./pages/transmission-details/transmission-details.module').then(
        m => m.TransmissionDetailsModule,
      ),
  },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
