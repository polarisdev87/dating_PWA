import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { XcodeDetailComponent } from './xcode-detail.component';

const routes: Routes = [
  {
    path: '',
    component: XcodeDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class XcodeDetailRoutingModule { }
