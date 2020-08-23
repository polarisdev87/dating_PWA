import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserAppComponent } from '@shared/component';
import { LoaderService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { auth } from 'firebase/app';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { MessageModalComponent } from 'src/app/components';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent extends UserAppComponent implements OnInit {

  title: string = 'MY OPTIONS';
  currentUser: any;
  checked: boolean;

  constructor(private router: Router,
    public firebaseService: AngularFireAuth,
    public firebaseDBService: AngularFireDatabase,
    public loaderService: LoaderService,
    private messageService: MessageModalComponent,
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.currentUser = {};
    this.fetchUserDetails().then((response: any) => {
      this.currentUser = response;
      this.checked = response.isDiscreteMode;
    });

  }

  back() {
    this.router.navigate(['my-profile']);
  }

  /**
   * @description TO logout current user
   */
  async logout() {
    let user = JSON.parse(localStorage.getItem('me'));
    let updateFcmData = await this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(user.id).update({'fcmToken':''});
    let updateStatusData = await this.firebaseDBService.database.ref().child(DBREFKEY.ACTIVEUSERS).child(user.id).update({'status':false,'timestamp':Date.now()});
    this.firebaseService.auth.signOut();
    if (this.currentUser.isSocialAccount) {      
      auth().signOut();
    }
    localStorage.removeItem('me');
    this.router.navigate(['login']);
  }

  async changeDiscreetMode(response: any) {
    this.checked = response;
    let updateDiscrete = await this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.currentUser.uid).update({'isDiscreteMode':this.checked});
    this.updateUserDetails().then(response=>{
      this.messageService.open('success', '', 'Discrete Mode has been changed.', false, '');
    });
  }
}
