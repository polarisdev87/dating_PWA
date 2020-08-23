import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService, ChatService } from 'src/app/services';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { CONSTANT } from '@shared/constant';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-invite-friends',
  templateUrl: './invite-friends.component.html',
  styleUrls: ['./invite-friends.component.scss']
})
export class InviteFriendsComponent implements OnInit {

  title: string = 'INVITE FRIENDS';
  myProfile;
  isMale: boolean = false;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public loaderService: LoaderService,
    public paymentService: PaymentService,
    public chatService: ChatService,
    private ngNavigatorShareService: NgNavigatorShareService,
    public firebaseDBService: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.myProfile = JSON.parse(localStorage.getItem('me'));
    if (this.myProfile.isApproved === false) {
      location.href = '/finish-profile';
    }
    if (this.myProfile.gender.toLowerCase() === "female") {
      this.isMale = false;
    } else {
      this.isMale = true;
    }
  }

  back() {
    this.router.navigate(['options']);
  }

  async redirectToXCode() {
    let user = JSON.parse(localStorage.getItem('me'));
    if (user && user.gender.toLowerCase() === "female") {
      if (user.xCode == undefined || user.xCode == '') {
        this.loaderService.display(true);
        let updateXcode = await this.updateUserXcodeDetails(user.id);
        this.loaderService.display(false);
      }
    }
    this.router.navigate(['options/invite-friends/x-code']);
  }

  updateUserXcodeDetails(userId) {
    return new Promise(async (resolve, reject) => {
      let xCodeData = await this.get8DigitRandomNumber();
      let xCode = xCodeData.toString();
      let updateQuery = await this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userId)
        .update({ 'xCode': xCode });
      let refreshData = await this.chatService.refreshMeData(userId);
      return resolve(true);
    })
  }

  get8DigitRandomNumber() {
    return new Promise((resolve, reject) => {
      let code = Math.floor(Math.random() * 90000000) + 10000000;
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).orderByChild('xCode').equalTo(code.toString())
        .once('value', snapshot => {
          var xCodeData = snapshot.val();
          if (xCodeData) {
            let keys = Object.keys(xCodeData);
            if (keys && keys.length > 0) {
              this.get8DigitRandomNumber();
            } else {
              return resolve(code);
            }
          } else {
            return resolve(code);
          }
        })
    })
  }

  shareInvite() {
    let message = `Hey Its ${this.myProfile.alias},\n\nIm inviting you to Xclusive an Invite-only dating app. Tap the link below to join in on the fun:`
    var share = {
      title: 'Xclusive : Invitation',
      text: message,
      url: environment.FIREBASE_KEYS.frontUrlLive
    };
    this.ngNavigatorShareService.share(share).then((response) => {
    }).catch((error) => {
      console.log(error);
    });
  }

}
