import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddFemaleCardRoutingModule } from './add-female-card-routing.module';
import { AddFemaleCardComponent } from './add-female-card.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../../header/header.module';


@NgModule({
  declarations: [AddFemaleCardComponent],
  imports: [
    CommonModule,
    AddFemaleCardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ]
})
export class AddFemaleCardModule { }
