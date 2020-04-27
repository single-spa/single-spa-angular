import { Routes, RouterModule } from '@angular/router';

import { RoomsComponent } from './rooms.component';

const routes: Routes = [
  {
    path: '',
    component: RoomsComponent,
  },
];

export const RoomsRoutingModule = RouterModule.forChild(routes);
