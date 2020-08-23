import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InterestComponent } from './interest.component';
import { InterestResolverService } from './interest-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: InterestComponent,
    resolve: {
      interest: InterestResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [InterestResolverService],
  exports: [RouterModule]
})
export class InterestRoutingModule { }
