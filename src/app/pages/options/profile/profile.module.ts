import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { HeaderModule } from '../../header/header.module';
import {NgxImageCompressService} from 'ngx-image-compress';
import { NgxPicaModule } from '@digitalascetic/ngx-pica';

@NgModule({
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderModule,
    NgxPicaModule
  ],
  declarations: [
    ProfileComponent
  ],
  providers: [NgxImageCompressService],
})
export class ProfileModule { }
