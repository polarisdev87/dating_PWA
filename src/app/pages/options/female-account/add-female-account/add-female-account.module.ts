import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddFemaleAccountRoutingModule } from './add-female-account-routing.module';
import { AddFemaleAccountComponent } from './add-female-account.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../../header/header.module';

import { DateOfBirthDirective } from '../../../../shared/directives/date-of-birth.directive';

@NgModule({
  declarations: [AddFemaleAccountComponent,DateOfBirthDirective],
  imports: [
    CommonModule,
    AddFemaleAccountRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ]
})
export class AddFemaleAccountModule { }
