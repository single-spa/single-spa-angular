import { Routes, RouterModule } from '@angular/router';

import { GroupsComponent } from './groups.component';

const routes: Routes = [
  {
    path: '',
    component: GroupsComponent,
  },
];

export const GroupsRoutingModule = RouterModule.forChild(routes);
