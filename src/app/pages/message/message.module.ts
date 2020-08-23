import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { MessageComponent } from './message.component';
import { MessageRoutingModule } from './message-routing.module';
import { MessageDate } from '../../shared/custom-pipes/message-date.pipe';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  imports: [
    CommonModule,
    MessageRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxHmCarouselModule,
    HeaderModule,
    FooterModule,
    OrderModule
  ],
  declarations: [
    MessageComponent,
    MessageDate
  ]
})
export class MessageModule { }
