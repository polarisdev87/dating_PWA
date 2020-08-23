import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeedComponent } from './feed.component';
import { FeedResolverService } from './feed-resolver.service';
import { DiscoveryComponent } from './discovery/discovery.component';

const routes: Routes = [
  {
    path: '',
    component: FeedComponent,
    resolve: {
      feed: FeedResolverService
    }
  },
  {
    path: 'discovery',
    component: DiscoveryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [FeedResolverService],
  exports: [RouterModule]
})
export class FeedRoutingModule { }
