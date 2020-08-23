import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleService } from 'src/app/services';
import { CanDeactivateGuard } from '@shared/can-deactivate.guard';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    LoginComponent,
  ],
  providers: [GoogleService, CanDeactivateGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginModule { }
