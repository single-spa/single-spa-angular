import type { Routes } from '@angular/router';

import { EmptyRouteComponent } from './components/empty-route/empty-route.component';

export const routes: Routes = [{ path: '**', component: EmptyRouteComponent }];
