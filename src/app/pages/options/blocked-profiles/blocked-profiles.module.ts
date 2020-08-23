import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule } from '../../header/header.module';
import { BlockedProfilesRoutingModule } from './blocked-profiles-routing.module';
import { BlockedProfilesComponent } from './blocked-profiles.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    BlockedProfilesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [BlockedProfilesComponent]
})
export class BlockedProfilesModule { }
