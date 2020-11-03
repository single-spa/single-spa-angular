import { Routes, RouterModule } from '@angular/router';

import { TransmissionDetailsComponent } from './transmission-details.component';

const routes: Routes = [
  {
    path: '',
    component: TransmissionDetailsComponent,
  },
];

export const TransmissionDetailsRoutingModule = RouterModule.forChild(routes);
