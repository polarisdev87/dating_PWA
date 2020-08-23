import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateHerComponent } from './date-her.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../../header/header.module';
import { FooterModule } from '../../footer/footer.module';
import { NgxHmCarouselModule } from 'ngx-hm-carousel';
import { Ng5SliderModule } from 'ng5-slider';
import { DateHerRoutingModule } from './date-her-routing.module';
import { HttpModule } from '@angular/http';
import { StarRatingModule } from 'angular-star-rating';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
    NgxHmCarouselModule,
    Ng5SliderModule,
    DateHerRoutingModule,
    HttpModule,
    StarRatingModule.forRoot()
  ],
  declarations: [DateHerComponent]
})
export class DateHerModule { }
