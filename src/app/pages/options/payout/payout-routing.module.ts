import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PayoutComponent } from './payout.component';


const routes: Routes = [
  {
    path: '',
    component: PayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayoutRoutingModule { }
