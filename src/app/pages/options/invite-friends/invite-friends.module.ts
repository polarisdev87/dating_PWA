import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InviteFriendsRoutingModule } from './invite-friends-routing.module';
import { InviteFriendsComponent } from './invite-friends.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../header/header.module';



@NgModule({
  declarations: [InviteFriendsComponent],
  imports: [
    CommonModule,
    InviteFriendsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ]
})
export class InviteFriendsModule { }
