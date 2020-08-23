import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InterestRoutingModule } from './interest-routing.module';
import { InterestComponent } from './interest.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    InterestRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [
    InterestComponent
  ]
})
export class InterestModule { }
