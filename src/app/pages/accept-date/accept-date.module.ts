import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { AcceptDateRoutingModule } from './accept-date-routing.module';
import { AcceptDateComponent } from './accept-date.component';

@NgModule({
  imports: [
    CommonModule,
    AcceptDateRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,  ],
  declarations: [
    AcceptDateComponent,
  ],
  providers: [],
})
export class AcceptDateModule { }
