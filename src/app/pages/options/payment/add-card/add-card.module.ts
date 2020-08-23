import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddCardRoutingModule } from './add-card-routing.module';
import { AddCardComponent } from './add-card.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../../header/header.module';


@NgModule({
  declarations: [AddCardComponent],
  imports: [
    CommonModule,
    AddCardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ]
})
export class AddCardModule { }
