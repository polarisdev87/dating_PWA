import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatesComponent } from './dates.component';
import { CanDeactivateGuard } from '@shared/can-deactivate.guard';

const routes: Routes = [
  {
    path: '',
    component: DatesComponent,
    canDeactivate: [CanDeactivateGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [CanDeactivateGuard],
  exports: [RouterModule]
})
export class DatesRoutingModule { }
