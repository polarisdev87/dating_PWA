import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OptionsRoutingModule } from './options-routing.module';
import { OptionsComponent } from './options.component';
import { HeaderModule } from '../header/header.module';
import { SharedComponentModule } from '@shared/shared-component/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    OptionsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    SharedComponentModule
  ],
  declarations: [
    OptionsComponent
  ],
  providers: []
})
export class OptionsModule { }
