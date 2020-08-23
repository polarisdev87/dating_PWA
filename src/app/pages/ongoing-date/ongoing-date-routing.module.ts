import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OngoingDateComponent } from './ongoing-date.component';

const routes: Routes = [
  {
    path:'',
    component:OngoingDateComponent
  },
  {
    path:'dates/endDate/:id',
    component:OngoingDateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OngoingDateRoutingModule { }
