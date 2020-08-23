import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { XcodeRoutingModule } from './x-code-routing.module';
import { XCodeComponent } from './x-code.component';

@NgModule({
  imports: [
    CommonModule,
    XcodeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule
  ],
  declarations: [
    XCodeComponent,
  ],
  providers: [],
})
export class XcodeModule { }
