import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileComponent} from './file.component';
import { FileRoutingModule } from './file-routing.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { FormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    FileRoutingModule,
    FormsModule,
    NgxHmCarouselModule
  ],
  declarations: [FileComponent]
})
export class FileModule { }