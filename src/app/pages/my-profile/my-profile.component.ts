import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/services';
import { UserAppComponent } from '@shared/component';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})

export class MyProfileComponent extends UserAppComponent implements OnInit {

  title: string = 'MY PROFILE';
  rgtIcon: string = 'eclipse_menu_icon.png';
  myProfile: any;
  currentYear = new Date().getFullYear();
  verify: any;
  leftBtn = false;
  follow = true;
  enablePan = true;
  index = 8;
  speed = 3000;
  infinite = true;
  direction = 'right';
  directionToggle = true;
  autoplay = false;
  avatars = [];
  zodiacSign = '';
  isMale = true;
  isFemale = true;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public firebaseDBService: AngularFireDatabase) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    this.fetchUserDetails().then(value => {
      this.loaderService.display(true);
      this.myProfile = value;
      this.isMale = this.myProfile.gender.toUpperCase() == 'MALE';
      this.isFemale = this.myProfile.gender.toUpperCase() == 'FEMALE';
      if (this.myProfile.profileMedia) {
        this.avatars = this.myProfile.profileMedia.map((x, i) => {
          return {
            url: x.mediaURL
          }
        })
      }
      const assetsURL = '../../../assets/images/';
      this.verify = {
        google: assetsURL + (this.myProfile.isGoogleVerified ? 'google-verified.png' : 'google-verify.png'),
        id: assetsURL + (this.myProfile.isGovernmentIDVerified ? 'id-verified.png' : 'id-verify.png'),
        email: assetsURL + (this.myProfile.isEmailVerified ? 'email-verified.png' : 'email-verify.png'),
        phone: assetsURL + (this.myProfile.isPhoneVerified ? 'phone-verified.png' : 'phone-verify.png')
      }
      this.zodiacSign = this.getEmojiSymbolForZodiacSign(this.myProfile.zodiacSign);


      if (this.myProfile.thumbCount !== undefined) {
        const up = this.myProfile.thumbCount.up ? this.myProfile.thumbCount.up + 10 : 10;
        const down = this.myProfile.thumbCount.down;
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
              this.myProfile.upthumbImage = true;
            } else if (ratingPercentage < 50 && ratingPercentage > 0) {
              this.myProfile.downthumbImage = true;
            }
        }
        this.myProfile.ratingPercentageString = (ratingPercentage != 0) ? (ratingPercentage + '%') : '';
        if (this.myProfile.ratingPercentageString != '') {
          this.myProfile.ratingPercentageString = this.myProfile.ratingPercentageString + ' |';
        }
      }else{
        this.myProfile.ratingPercentageString = '100%';
        this.myProfile.upthumbImage = true;
        if (this.myProfile.ratingPercentageString != '') {
          this.myProfile.ratingPercentageString = this.myProfile.ratingPercentageString + ' |';
        }
      }

      setTimeout(() => {
        this.loaderService.display(false);
      }, 500);
    });
  }

  right() {
    this.router.navigate(['options']);
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

  notificationCall(event){
    this.router.navigate(['/my-profile/notifications']);
  }
}
