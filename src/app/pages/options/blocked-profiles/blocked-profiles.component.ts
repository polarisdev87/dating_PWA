import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { UserAppComponent } from '@shared/component';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConfirmModalComponent } from 'src/app/components';
import { DBREFKEY } from '@shared/constant/dbRefConstant';

@Component({
  selector: 'app-blocked-profiles',
  templateUrl: './blocked-profiles.component.html',
  styleUrls: ['./blocked-profiles.component.scss']
})
export class BlockedProfilesComponent extends UserAppComponent implements OnInit {

  title: string = 'BLOCKED PROFILES';
  myProfile: any;
  blockedUser: Array<any>;
  status: string = 'Unblock Her';
  selectedBlockUser: any;
  selectedBlockUserIndex = -1;


  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public firebaseDBService: AngularFireDatabase,
    private confirmService: ConfirmModalComponent,
    private ngZone: NgZone
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('me'));
    if (user.isApproved === false) {
      location.href = '/finish-profile';
    }
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.fetchUserDetails().then(value => {
      this.myProfile = value;
      if (this.myProfile.blockedProfiles) {
        this.blockedUser = this.myProfile.blockedProfiles;
      }
      if (this.myProfile.gender.toUpperCase() == "FEMALE") {
        this.status = "Unblock Him";
      }
    });
  }

  unBlock(blockUser, index) {
    this.selectedBlockUser = blockUser;
    this.selectedBlockUserIndex = index;
    this.confirmService.openConfirm('error', 'Are you sure you want to unblock "' + blockUser.name + '" from your block list?', this.confirm, this.cancel, this);
  }

  confirm(that) {
    that.loaderService.display(true);
    that.myProfile.blockedProfiles.splice(that.selectedBlockUserIndex, 1);
    that.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(that.myProfile.uid).set(that.myProfile).then((data: any) => {
      that.updateUserDetails();
      that.loaderService.display(false);
    }, (error) => {
      that.loaderService.display(false);
    }).catch((error) => {
      that.loaderService.display(false);
    });
    that.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(that.selectedBlockUser.id.toString()).once('value', (snapshot) => {
      let user = snapshot.val();
      that.selectedBlockUser = undefined;
      that.selectedBlockUserIndex = -1;
      if (user.whoBlockedYou) {
        delete user.whoBlockedYou[that.myProfile.id];
        that.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(user.id).update({"whoBlockedYou":user.whoBlockedYou});  
      }
    });
  }

  cancel(that) {
    that.selectedBlockUserIndex = -1;
    that.selectedBlockUser = undefined;
  }

  back() {
    this.router.navigate(['options']);
  }

}
