import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentComponent } from './payment.component';
import { AddCardComponent } from './add-card/add-card.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentComponent
  },
  {
    path: 'add-card/:setAsDefault',
    loadChildren: () => import('./add-card/add-card.module').then(m => m.AddCardModule)
  },
  {
    path: 'add-card/:setAsDefault/:dateHer',
    loadChildren: () => import('./add-card/add-card.module').then(m => m.AddCardModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
