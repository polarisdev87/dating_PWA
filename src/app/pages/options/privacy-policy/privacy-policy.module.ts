import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PrivacyPolicyRoutingModule } from './privacy-policy-routing.module';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { HeaderModule } from '../../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    PdfViewerModule,
    PrivacyPolicyRoutingModule,
    HeaderModule
  ],
  declarations: [PrivacyPolicyComponent]
})
export class PrivacyPolicyModule { }
