import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { LoginResolverService } from './login-resolver.service';
import { CanDeactivateGuard } from '@shared/can-deactivate.guard';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    resolve: {
      login: LoginResolverService
    },
    canDeactivate: [CanDeactivateGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [LoginResolverService,CanDeactivateGuard],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
