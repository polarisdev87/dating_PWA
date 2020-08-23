import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatesComponent } from './dates.component';
import { DatesRoutingModule } from './dates-routing.module';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { CanDeactivateGuard } from '@shared/can-deactivate.guard';

@NgModule({
  imports: [
    CommonModule,
    DatesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule
  ],
  declarations: [
    DatesComponent,
  ],
  providers: [CanDeactivateGuard],
})
export class DatesModule { }
