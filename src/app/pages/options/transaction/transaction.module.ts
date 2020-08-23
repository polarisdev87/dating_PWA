import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule } from '../../header/header.module';
import { TransactionRoutingModule } from './transaction-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TransactionComponent } from './transaction.component';

@NgModule({
  imports: [
    CommonModule,
    TransactionRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [
    TransactionComponent
  ]
})
export class TransactionModule { }
