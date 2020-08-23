import { Injectable } from '@angular/core';
import { CanActivate,CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { MessageModalComponent } from '../components';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<any> {
 // loginStatus = true;
  constructor(public firebaseService: AngularFireAuth,
    private messageService: MessageModalComponent) {
  }
  subscription: any;
  canDeactivate(
    component: any,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if(component.componentName === 'dates') {
      if(!component.cancelDatePopup || component.modalOpenStatus === 'trt-confirm') {
        return true;
      } else {
        return false;
      }
    } else if(component.componentName === 'loginComponent') {
      if(component.loginStatus) {
        return true;
       } else {
         return false;
       }
    }

    
   }
}
