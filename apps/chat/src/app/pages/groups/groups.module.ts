import { NgModule } from '@angular/core';

import { GroupsRoutingModule } from './groups-routing.module';

import { GroupsComponent } from './groups.component';

@NgModule({
  imports: [GroupsRoutingModule],
  declarations: [GroupsComponent],
})
export class GroupsModule {}
