import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyProfileComponent } from './my-profile.component';

const routes: Routes = [
  {
    path: '',
    component: MyProfileComponent
  },
  {
    path: 'earnings',
    loadChildren: () => import('./earnings/earnings.module').then(m => m.EarningsModule)
  },
  {
    path: 'earnings/:detailPage',
    loadChildren: () => import('./earnings/earnings.module').then(m => m.EarningsModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class myProfileRoutingModule { }
