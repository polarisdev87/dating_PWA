import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddFemaleCardComponent } from "./add-female-card.component";
const routes: Routes = [
    {
        path: '',
        component: AddFemaleCardComponent,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddFemaleCardRoutingModule { }
