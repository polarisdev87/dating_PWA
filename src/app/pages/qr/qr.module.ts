import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrComponent } from './qr.component';
import { QrRoutingModule } from './qr-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  imports: [
    CommonModule,
    QrRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    ZXingScannerModule
  ],
  declarations: [
    QrComponent,
  ],
  providers: [],
})
export class QrModule { }
