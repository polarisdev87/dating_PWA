import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FemaleAccountRoutingModule } from './female-account-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FemaleAccountComponent } from './female-account.component';
import { HeaderModule } from '../../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FemaleAccountRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [FemaleAccountComponent]
})
export class FemaleAccountModule { }
