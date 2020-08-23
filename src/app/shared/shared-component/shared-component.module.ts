import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockComponent } from '@shared/component/clock.component';
import { ToggleButtonComponent } from '../../components/toggle-button.component';
import { FormsModule } from '@angular/forms'; 
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ClockComponent,
    ToggleButtonComponent
  ],
  exports: [
    ClockComponent,
    ToggleButtonComponent
  ]
})
export class SharedComponentModule { }
