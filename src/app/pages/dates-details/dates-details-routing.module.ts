import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatesDetailsComponent } from './dates-details.component';

const routes: Routes = [
  {
    path: '',
    component: DatesDetailsComponent,
  },
  {
    path: 'dates/scanQr/:id',
    component: DatesDetailsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class DatesDetailsRoutingModule { }
