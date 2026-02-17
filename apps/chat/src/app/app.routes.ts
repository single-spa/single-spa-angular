import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'groups',
    loadComponent: () => import('./pages/groups/groups.component').then(m => m.GroupsComponent),
  },
  {
    path: 'rooms',
    loadComponent: () => import('./pages/rooms/rooms.component').then(m => m.RoomsComponent),
  },
];
