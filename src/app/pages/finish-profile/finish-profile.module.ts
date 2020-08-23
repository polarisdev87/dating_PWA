import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { FinishProfileComponent } from './finish-profile.component';
import { FinishProfileRoutingModule } from './finish-profile-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
    NgxHmCarouselModule,
    FinishProfileRoutingModule
  ],
  declarations: [
    FinishProfileComponent,
  ],
  providers: [],
})
export class FinishProfileModule { }
