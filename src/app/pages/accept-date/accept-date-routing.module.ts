import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AcceptDateComponent } from './accept-date.component';

const routes: Routes = [
  {
    path: '',
    component: AcceptDateComponent,
  },
  {
    path: 'dates-details/decinedDate/:id',
    component: AcceptDateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class AcceptDateRoutingModule { }
