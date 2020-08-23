import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from '@shared/can-deactivate.guard';
import { FinishProfileComponent } from './finish-profile.component';

const routes: Routes = [
  {
    path: '',
    component: FinishProfileComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [CanDeactivateGuard],
  exports: [RouterModule]
})
export class FinishProfileRoutingModule { }
