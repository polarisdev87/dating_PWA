import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsRoutingModule } from './terms-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TermsComponent } from './terms.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { HeaderModule } from '../../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    TermsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
    HeaderModule
  ],
  declarations: [
    TermsComponent
  ]
})
export class TermsModule { }
