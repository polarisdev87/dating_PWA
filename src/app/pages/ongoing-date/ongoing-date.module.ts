import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OngoingDateRoutingModule } from './ongoing-date-routing.module';
import { OngoingDateComponent } from './ongoing-date.component';
import { HeaderModule } from '../header/header.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedComponentModule } from '@shared/shared-component/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    OngoingDateRoutingModule,
    HeaderModule,
    ReactiveFormsModule,
    SharedComponentModule
  ],
  declarations: [OngoingDateComponent]
})
export class OngoingDateModule { }
