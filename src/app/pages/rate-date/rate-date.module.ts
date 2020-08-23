import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RateDateRoutingModule } from './rate-date-routing.module';
import { RateDateComponent } from './rate-date.component';
import { HeaderModule } from '../header/header.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RateDateRoutingModule,
    HeaderModule,
    ReactiveFormsModule
  ],
  declarations: [RateDateComponent]
})
export class RateDateModule { }
