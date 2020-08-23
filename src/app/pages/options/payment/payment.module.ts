import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentRoutingModule } from './payment-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaymentComponent } from './payment.component';
import { HeaderModule } from '../../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    PaymentRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [PaymentComponent]
})
export class PaymentModule { }
