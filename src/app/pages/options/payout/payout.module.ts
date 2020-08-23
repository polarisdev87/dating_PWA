import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PayoutRoutingModule } from './payout-routing.module';
import { PayoutComponent } from './payout.component';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../header/header.module';


@NgModule({
  declarations: [PayoutComponent],
  imports: [
    CommonModule,
    PayoutRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ]
})
export class PayoutModule { }
