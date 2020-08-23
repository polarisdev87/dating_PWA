import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DateHerComponent } from "./date-her.component";
const routes: Routes = [
    {
        path: '',
        component: DateHerComponent,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)] ,
  exports: [RouterModule]
})
export class DateHerRoutingModule { }
