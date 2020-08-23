import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FundTransferRoutingModule } from './fund-transfer-routing.module';
import { FundTransferComponent } from './fund-transfer.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../../../pages/header/header.module';


@NgModule({
  declarations: [FundTransferComponent],
  imports: [
    CommonModule,
    FundTransferRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ]
})
export class FundTransferModule { }
