import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../header/header.module';
import { PreferredDatesComponent } from './preferred-dates.component';
import { PreferredDatestRoutingModule } from './preferred-dates-routing.module';

@NgModule({
  imports: [
    CommonModule,
    PreferredDatestRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [
    PreferredDatesComponent
  ]
})
export class PreferredDatesModule { }
