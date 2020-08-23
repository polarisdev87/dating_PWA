import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { XCodeComponent } from './x-code.component';

const routes: Routes = [
  {
    path: '',
    component: XCodeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class XcodeRoutingModule { }
