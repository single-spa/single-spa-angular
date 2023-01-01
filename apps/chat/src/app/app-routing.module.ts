import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'groups',
    loadChildren: () => import('./pages/groups/groups.module').then(m => m.GroupsModule),
  },
  {
    path: 'rooms',
    loadChildren: () => import('./pages/rooms/rooms.module').then(m => m.RoomsModule),
  },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
