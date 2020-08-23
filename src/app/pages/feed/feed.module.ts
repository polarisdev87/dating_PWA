import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './feed.component';
import { FeedRoutingModule } from './feed-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { FooterModule } from '../footer/footer.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { DiscoveryComponent } from './discovery/discovery.component';
import { Ng5SliderModule } from 'ng5-slider';
import { SharedComponentModule } from '@shared/shared-component/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    FeedRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
    NgxHmCarouselModule,
    Ng5SliderModule,
    SharedComponentModule
  ],
  declarations: [
    FeedComponent,
    DiscoveryComponent
  ],
  providers: [],
})
export class FeedModule { }
