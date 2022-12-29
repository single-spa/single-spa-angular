import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'images',
    loadChildren: () => import('./pages/images/images.module').then(m => m.ImagesModule),
  },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
