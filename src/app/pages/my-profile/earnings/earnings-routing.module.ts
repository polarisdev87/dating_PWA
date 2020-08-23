import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EarningsComponent } from "./earnings.component";
const routes: Routes = [
    {
        path: '',
        component: EarningsComponent,
    },
    {
      path: 'fund-transfer',
      loadChildren: () => import('./fund-transfer/fund-transfer.module').then(m => m.FundTransferModule)
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EarningsRoutingModule { }
