import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddCardComponent } from "./add-card.component";
const routes: Routes = [
    {
        path: '',
        component: AddCardComponent,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddCardRoutingModule { }
