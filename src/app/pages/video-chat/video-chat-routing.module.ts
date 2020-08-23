import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoChatComponent } from './video-chat.component';

const routes: Routes = [
  {
    path: '',
    component: VideoChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoChatRoutingModule { }
