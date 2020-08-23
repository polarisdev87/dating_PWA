import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlockedProfilesComponent } from './blocked-profiles.component';

const routes: Routes = [
  {
    path: '',
    component: BlockedProfilesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlockedProfilesRoutingModule { }
