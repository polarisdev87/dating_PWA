import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QrComponent } from './qr.component';
import { QrResolverService } from './qr-resolver.service';
const routes: Routes = [
  {
    path: '',
    component: QrComponent,
    resolve: {
      qr: QrResolverService
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [QrResolverService],
  exports: [RouterModule]
})
export class QrRoutingModule { }
