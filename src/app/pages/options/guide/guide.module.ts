import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuideRoutingModule } from './guide-routing.module';
import { GuideComponent } from './guide.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    GuideRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [
    GuideComponent
  ]
})
export class GuideModule { }
