import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FundTransferComponent } from "./fund-transfer.component";
const routes: Routes = [
    {
        path: '',
        component: FundTransferComponent,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FundTransferRoutingModule { }
