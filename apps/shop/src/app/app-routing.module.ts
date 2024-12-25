import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/transmissions/transmissions.component'),
  },
  {
    path: 'transmission/:id',
    loadComponent: () => import('./pages/transmission-details/transmission-details.component'),
  },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
