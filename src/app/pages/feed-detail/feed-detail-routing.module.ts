import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeedDetailComponent } from './feed-detail.component';

const routes: Routes = [
  {
    path: '',
    component: FeedDetailComponent,
  },
  {
    path: 'date-her/:id/:currentPage',
    loadChildren: () => import('./date-her/date-her.module').then(m => m.DateHerModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class FeedDetailRoutingModule { }
