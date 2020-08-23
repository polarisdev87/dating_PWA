import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { MyProfileComponent } from './my-profile.component';
import { myProfileRoutingModule } from './my-profile-routing.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';

@NgModule({
  imports: [
    CommonModule,
    myProfileRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxHmCarouselModule,
    HeaderModule,
    FooterModule
  ],
  declarations: [
    MyProfileComponent
  ]
})
export class myProfileModule { }
