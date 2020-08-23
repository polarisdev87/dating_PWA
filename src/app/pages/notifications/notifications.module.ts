import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { NotificationsComponent } from './notifications.component';
import { NotificationsRoutingModule } from './notifications-routing.module';

@NgModule({
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxHmCarouselModule,
    HeaderModule,
    FooterModule
  ],
  declarations: [
    NotificationsComponent
  ]
})
export class NotificationsModule { }
