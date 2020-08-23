import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,RouterModule,FormsModule
  ],
  exports: [HeaderComponent],
  declarations: [HeaderComponent],
})
export class HeaderModule { }
