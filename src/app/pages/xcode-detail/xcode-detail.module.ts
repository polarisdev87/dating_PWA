import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { XcodeDetailRoutingModule } from './xcode-detail-routing.module';
import { XcodeDetailComponent } from './xcode-detail.component';

@NgModule({
  imports: [
    CommonModule,
    XcodeDetailRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
    NgxHmCarouselModule
  ],
  declarations: [
    XcodeDetailComponent,
  ],
  providers: [],
})
export class XcodeDetailModule { }
