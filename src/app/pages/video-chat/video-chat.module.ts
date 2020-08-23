import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoChatRoutingModule } from './video-chat-routing.module';
import { VideoChatComponent } from './video-chat.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { SharedComponentModule } from '@shared/shared-component/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    VideoChatRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
    SharedComponentModule
  ],
  declarations: [VideoChatComponent],
})
export class VideoChatModule { }
