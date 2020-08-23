import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserAppComponent } from '@shared/component';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService, ChatService, SendNotificationService, SendSmsService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { ConfirmModalComponent } from 'src/app/components';
import * as uuid from 'uuid/v1';
@Component({
  selector: 'app-xcode-detail',
  templateUrl: './xcode-detail.component.html',
  styleUrls: ['./xcode-detail.component.scss']
})
export class XcodeDetailComponent extends UserAppComponent implements OnInit {

  title: string = 'NAME';
  leftBtn = false;
  xCodeInvalid = false;
  rgtIcon: string = 'favorite_inactive.png';
  feedUser: any;
  myProfile: any;
  verify: any;
  currentYear = new Date().getFullYear();
  isMale = true;
  feedUserStatus = false;
  activeUserSubscribe;
  activeUserRef;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    private route: ActivatedRoute,
    public firebaseDBService: AngularFireDatabase,
    private confirmService: ConfirmModalComponent,
    private chatService: ChatService,
    private sendNotificationService: SendNotificationService,
    private sendSmsService: SendSmsService
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    const xCode: number = this.route.snapshot.params["xCode"];
    if (typeof xCode !== 'undefined') this.dialCode(xCode);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }

  async dialCode(number){
    this.xCodeInvalid = false;
    if(number.length == 8){
      this.loaderService.display(true);
      let checkXcodeUserData: any = await this.checkXcodeUser(number);
      if(checkXcodeUserData.status === 1){
          this.xCodeInvalid = false;
          this.firebaseDBService.database
          .ref()
          .child(DBREFKEY.USERS)
          .child(checkXcodeUserData.data)
          .once('value', async (snapshot) => {
            this.feedUser = snapshot.val();
            this.title = this.feedUser.alias.trim();
            const assetsURL = '../../../assets/images/';
            this.verify = {
              google: assetsURL + (this.feedUser.isGoogleVerified ? 'google-verified.png' : 'google-verify.png'),
              id: assetsURL + (this.feedUser.isGovernmentIDVerified ? 'id-verified.png' : 'id-verify.png'),
              email: assetsURL + (this.feedUser.isEmailVerified ? 'email-verified.png' : 'email-verify.png'),
              phone: assetsURL + (this.feedUser.isPhoneVerified ? 'phone-verified.png' : 'phone-verify.png')
            }

            if (this.feedUser.thumbCount !== undefined) {
              const up = this.feedUser.thumbCount.up ? this.feedUser.thumbCount.up + 10 : 10;
              const down = this.feedUser.thumbCount.down;
              let totalCount = 0;
              if (up != undefined) {
                  totalCount = totalCount + up;
              }
              if (down != undefined) {
                  totalCount = totalCount + down;
              }
              let ratingPercentage = 0;
              if (totalCount !== 0) {
                  ratingPercentage = (up != undefined) ? (Math.floor((100 * up) / (totalCount))) : 0;
                  if (ratingPercentage >= 50) {
                    this.feedUser.upthumbImage = true;
                  } else if (ratingPercentage < 50 && ratingPercentage > 0) {
                    this.feedUser.downthumbImage = true;
                  }
              }
              this.feedUser.ratingPercentageString = (ratingPercentage != 0) ? (ratingPercentage + '%') : '';
              if (this.feedUser.ratingPercentageString != '') {
                this.feedUser.ratingPercentageString = this.feedUser.ratingPercentageString + ' |';
              }
            }else{
              this.feedUser.ratingPercentageString = '100%';
              this.feedUser.upthumbImage = true;
              if (this.feedUser.ratingPercentageString != '') {
                this.feedUser.ratingPercentageString = this.feedUser.ratingPercentageString + ' |';
              }
            }

            this.feedUser.distance = 0.0;
            this.feedUser.zodiacSignIcon = this.getEmojiSymbolForZodiacSign(this.feedUser.zodiacSign);
            this.feedUser.isMale = this.feedUser.gender.toUpperCase() == 'MALE';
            setTimeout(() => {
              this.loaderService.display(false);
            }, 200);
          });
      } else {
        this.xCodeInvalid = true;
        this.loaderService.display(false);
      }
    }
  }

  checkXcodeUser(code){
    return new Promise((resolve,reject)=>{
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).orderByChild('xCode').equalTo(code.toString())
      .once('value', snapshot => {
        var xCodeData = snapshot.val();
        if(xCodeData){
          let keys = Object.keys(xCodeData);
          if(keys && keys.length > 0){
            let userId = xCodeData[keys[0]].id;
            return resolve({status:1,data:userId});
          } else {
            return resolve({status:3});
          }
        } else {
          return resolve({status:3});
        }
      })
    })
  }

  right() {
    this.confirmService.openConfirm('info', 'Please register or sign-in to continue. Do not worry it takes less than 5mins!', this.cancel,this.redirectLogin, this, 'Cancel', 'Okay');
  }

  getEmojiSymbolForZodiacSign(zodiacSign: String) {
    switch (zodiacSign) {
      case "Aquarius":
        return "♒️"
        break;
      case "Pisces":
        return "♓️"
        break;
      case "Aries":
        return "♈️"
        break;
      case "Taurus":
        return "♉️"
        break;
      case "Gemini":
        return "♊️"
        break;
      case "Cancer":
        return "♋️"
        break;
      case "Virgo":
        return "♍️"
        break;
      case "Leo":
        return "♌️"
        break;
      case "Libra":
        return "♎️"
        break;
      case "Scorpio":
        return "♏️"
        break;
      case "Sagittarius":
        return "♐️"
        break;
      case "Capricorn":
        return "♑️"
        break;
      default:
        return ""
        break;
    }

  }

  dateHer() {
    this.confirmService.openConfirm('info', 'Please register or sign-in to continue. Do not worry it takes less than 5 mins!', this.cancel,this.redirectLogin, this, 'Cancel', 'Okay');
  }

  cancel() { }

  redirectLogin(){
    if (localStorage.getItem("isAgreed")) {
      location.href = "/login";
    }else{
      location.href = "/terms";
    }
  }
}
