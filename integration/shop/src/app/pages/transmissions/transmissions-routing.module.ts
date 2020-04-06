import { Routes, RouterModule } from '@angular/router';

import { TransmissionsComponent } from './transmissions.component';

const routes: Routes = [
  {
    path: '',
    component: TransmissionsComponent,
  },
];

export const TransmissionsRoutingModule = RouterModule.forChild(routes);
