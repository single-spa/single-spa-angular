import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component'),
  },
  {
    path: 'images',
    loadComponent: () => import('./pages/images/images.component'),
  },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
