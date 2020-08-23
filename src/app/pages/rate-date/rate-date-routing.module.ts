import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RateDateComponent } from './rate-date.component';

const routes: Routes = [
  {
    path:'',
    component:RateDateComponent
  },
  {
    path:'dates/endDate/:id',
    component:RateDateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RateDateRoutingModule { }
