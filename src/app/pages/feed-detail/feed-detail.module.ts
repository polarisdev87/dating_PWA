import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { FeedDetailRoutingModule } from './feed-detail-routing.module';
import { FeedDetailComponent } from './feed-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FeedDetailRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
    NgxHmCarouselModule
  ],
  declarations: [
    FeedDetailComponent,
  ],
  providers: [],
})
export class FeedDetailModule { }
