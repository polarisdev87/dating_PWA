import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiscoveryRoutingModule } from './discovery-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../../header/header.module';
import { FooterModule } from '../../footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    DiscoveryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
  ],
  declarations: [],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class DiscoveryModule { }
