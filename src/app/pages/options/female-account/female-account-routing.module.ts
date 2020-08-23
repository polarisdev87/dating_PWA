import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FemaleAccountComponent } from './female-account.component';

const routes: Routes = [
  {
    path: '',
    component: FemaleAccountComponent
  },
  {
    path: 'add-female-card',
    loadChildren: () => import('./add-female-card/add-female-card.module').then(m => m.AddFemaleCardModule)
  },
  {
    path: 'add-female-account',
    loadChildren: () => import('./add-female-account/add-female-account.module').then(m => m.AddFemaleAccountModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FemaleAccountRoutingModule { }
