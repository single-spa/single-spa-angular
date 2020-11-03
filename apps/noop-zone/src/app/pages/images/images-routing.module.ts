import { Routes, RouterModule } from '@angular/router';

import { ImagesComponent } from './images.component';

const routes: Routes = [
  {
    path: '',
    component: ImagesComponent,
  },
];

export const ImagesRoutingModule = RouterModule.forChild(routes);
