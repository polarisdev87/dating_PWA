import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddFemaleAccountComponent } from "./add-female-account.component";
const routes: Routes = [
    {
        path: '',
        component: AddFemaleAccountComponent,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddFemaleAccountRoutingModule { }
