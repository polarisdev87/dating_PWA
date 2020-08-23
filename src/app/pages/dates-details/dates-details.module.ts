import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { DatesDetailsRoutingModule } from './dates-details-routing.module';
import { DatesDetailsComponent } from './dates-details.component';
import { QRCodeModule } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
@NgModule({
  imports: [
    CommonModule,
    DatesDetailsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
    QRCodeModule,
    ZXingScannerModule
  ],
  declarations: [
    DatesDetailsComponent,
  ],
  providers: [],
})
export class DatesDetailsModule { }
