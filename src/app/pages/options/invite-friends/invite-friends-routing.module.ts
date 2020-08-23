import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InviteFriendsComponent } from './invite-friends.component';

const routes: Routes = [
  {
    path: '',
    component: InviteFriendsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InviteFriendsRoutingModule { }
