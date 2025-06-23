import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'groups',
    loadComponent: () => import('./pages/groups/groups.component'),
  },
  {
    path: 'rooms',
    loadComponent: () => import('./pages/rooms/rooms.component'),
  },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
