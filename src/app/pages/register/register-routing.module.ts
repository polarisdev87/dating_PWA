import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './register.component';
import { RegisterResolverService } from './register-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    resolve: {
      register: RegisterResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [RegisterResolverService],
  exports: [RouterModule]
})
export class RegisterRoutingModule { }
