import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportProblemComponent } from './report-problem.component';

const routes: Routes = [
  {
    path: '',
    component: ReportProblemComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportProblemRoutingModule { }
