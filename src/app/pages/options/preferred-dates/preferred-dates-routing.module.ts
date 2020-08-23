import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreferredDatesComponent } from './preferred-dates.component';

const routes: Routes = [
  {
    path: '',
    component: PreferredDatesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class PreferredDatestRoutingModule { }
