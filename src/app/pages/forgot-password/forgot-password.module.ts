import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './forgot-password.component';
import { HeaderModule } from '../header/header.module';
import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ForgotPasswordRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule
  ],
  declarations: [
    ForgotPasswordComponent
  ]
})
export class ForgotPasswordModule { }
