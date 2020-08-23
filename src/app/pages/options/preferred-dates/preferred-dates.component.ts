import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageModalComponent } from 'src/app/components';
import { MESSAGE, CONSTANT } from '@shared/constant';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService } from 'src/app/services';
import { UserAppComponent } from '@shared/component';

@Component({
  selector: 'app-preferred-dates',
  templateUrl: './preferred-dates.component.html',
  styleUrls: ['./preferred-dates.component.scss']
})
export class PreferredDatesComponent extends UserAppComponent implements OnInit {

  title: string = 'DATES AND RATES';
  rgtBtn: string = 'SAVE';
  preferredDate: any;
  errorMessage: any;
  myProfile: any;
  minRate: number;
  maxRate: number;
  leftBtn: boolean;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageSevice: MessageModalComponent,
    public firebaseDBService: AngularFireDatabase,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.minRate = CONSTANT.CHIC_MIN_RATE;
    this.maxRate = CONSTANT.CHIC_MAX_RATE;

    this.preferredDate = {
      dinner: false,
      cocktail: false,
      specialEvent: false,
      videoChat: false,
      level: 'CHIC',
      dinnerRate: 0,
      cocktailRate: 0,
      eventRate: 0,
      videoChatRate: 0
    }
    this.fetchUserDetails().then((response) => {
      this.myProfile = response;
      this.leftBtn = this.myProfile.isProfileCompleted;
      if (this.myProfile.dateAndRate && this.myProfile.dateAndRate.preferredDate) {
        this.preferredDate.level = this.myProfile.dateAndRate.xclusiveLevel;
        switch (this.myProfile.dateAndRate.xclusiveLevel) {
          case 'CHIC':
            this.minRate = CONSTANT.CHIC_MIN_RATE;
            this.maxRate = CONSTANT.CHIC_MAX_RATE;
            break;
          case 'COSMO':
            this.minRate = CONSTANT.COSMO_MIN_RATE;
            this.maxRate = CONSTANT.COSMO_MAX_RATE;
            break;
          case 'CLASSY':
            this.minRate = CONSTANT.CLASSY__MIN_RATE;
            this.maxRate = CONSTANT.CLASSY__MAX_RATE;
            break;
          case 'LUXE':
            this.minRate = CONSTANT.LUXE__MIN_RATE;
            this.maxRate = 10000000;
            break;
          default:
            break;
        }
        if (this.myProfile.dateAndRate.preferredDate.Cocktails) {
          this.preferredDate.cocktail = true;
          this.preferredDate.cocktailRate = parseInt(this.myProfile.dateAndRate.preferredDate.Cocktails);
        }
        if (this.myProfile.dateAndRate.preferredDate.Dinner) {
          this.preferredDate.dinner = true;
          this.preferredDate.dinnerRate = parseInt(this.myProfile.dateAndRate.preferredDate.Dinner);
        }
        if (this.myProfile.dateAndRate.preferredDate['Special Event']) {
          this.preferredDate.specialEvent = true;
          this.preferredDate.eventRate = parseInt(this.myProfile.dateAndRate.preferredDate['Special Event']);
        }
        // video chat
        if (this.myProfile.dateAndRate.preferredDate['Video Chat']) {
          this.preferredDate.videoChat = true;
          this.preferredDate.videoChatRate = parseInt(this.myProfile.dateAndRate.preferredDate['Video Chat']);
        }
      } else {
        this.preferredDate = {
          dinner: true,
          cocktail: true,
          specialEvent: false,
          videoChat: true,
          level: 'CHIC',
          dinnerRate: this.minRate,
          cocktailRate: this.minRate,
          eventRate: 0,
          videoChatRate: this.minRate
        }
      }
    });
  }

  back() {
    this.router.navigate(['options']);
  }

  right() {
    this.saveDateAndRate();
  }

  validations() {
    if (!this.preferredDate.dinner && !this.preferredDate.cocktail && !this.preferredDate.specialEvent && !this.preferredDate.videoChat) {
      this.errorMessage = MESSAGE.PROVIDE_PREFERRED_DATE;
    }
    else if (this.preferredDate.dinner && this.preferredDate.dinnerRate === null) {
      this.errorMessage = `${MESSAGE.PROVIDE_DINNER_RATE}.`;
    }
    else if (this.preferredDate.dinner && this.preferredDate.dinnerRate !== '' && this.preferredDate.dinnerRate < this.minRate) {
      this.errorMessage = `${MESSAGE.PROVIDE_DINNER_RATE} above $${this.minRate - 1}`
    }
    else if (this.preferredDate.dinner && this.preferredDate.dinnerRate !== '' && this.preferredDate.dinnerRate > this.maxRate) {
      this.errorMessage = `${MESSAGE.PROVIDE_DINNER_RATE} between $${this.minRate} - $${this.maxRate}`
    }


    else if (this.preferredDate.cocktail && this.preferredDate.cocktailRate === null) {
      this.errorMessage = `${MESSAGE.PROVIDE_COCKTAIL_RATE}`;
    }
    else if (this.preferredDate.cocktail && this.preferredDate.cocktailRate !== '' && this.preferredDate.cocktailRate < this.minRate) {
      this.errorMessage = `${MESSAGE.PROVIDE_COCKTAIL_RATE} above $ ${this.minRate - 1}`
    }
    else if (this.preferredDate.cocktail && this.preferredDate.cocktailRate !== '' && this.preferredDate.cocktailRate > this.maxRate) {
      this.errorMessage = `${MESSAGE.PROVIDE_COCKTAIL_RATE} between $ ${this.minRate} - ${this.maxRate}`
    }


    else if (this.preferredDate.specialEvent && this.preferredDate.eventRate === null) {
      this.errorMessage = `${MESSAGE.PROVIDE_EVENT_RATE} `;
    }
    else if (this.preferredDate.specialEvent && this.preferredDate.eventRate !== '' && this.preferredDate.eventRate < this.minRate) {
      this.errorMessage = `${MESSAGE.PROVIDE_EVENT_RATE} above $ ${this.minRate - 1}`
    }
    else if (this.preferredDate.specialEvent && this.preferredDate.eventRate !== '' && this.preferredDate.eventRate > this.maxRate) {
      this.errorMessage = `${MESSAGE.PROVIDE_EVENT_RATE} between $ ${this.minRate} - ${this.maxRate}`
    }

    else if (this.preferredDate.videoChat && this.preferredDate.videoChatRate === null) {
      this.errorMessage = `${MESSAGE.PROVIDE_VIDEO_CHAT_RATE} `;
    }
    else if (this.preferredDate.videoChat && this.preferredDate.videoChatRate !== '' && this.preferredDate.videoChatRate < this.minRate) {
      this.errorMessage = `${MESSAGE.PROVIDE_VIDEO_CHAT_RATE} above $ ${this.minRate - 1}`
    }
    else if (this.preferredDate.videoChat && this.preferredDate.videoChatRate !== '' && this.preferredDate.videoChatRate > this.maxRate) {
      this.errorMessage = `${MESSAGE.PROVIDE_VIDEO_CHAT_RATE} between $ ${this.minRate} - ${this.maxRate}`
    }
    if (this.errorMessage) {
      this.messageSevice.open('error', '', this.errorMessage, false, '');
    }
  }

  setRate(type) {
    switch (type) {
      case 'CHIC':
        this.minRate = CONSTANT.CHIC_MIN_RATE;
        this.maxRate = CONSTANT.CHIC_MAX_RATE;
        this.preferredDate.dinnerRate = this.minRate;
        this.preferredDate.cocktailRate = this.minRate;
        this.preferredDate.eventRate = this.minRate;
        this.preferredDate.videoChatRate = this.minRate;
        break;
      case 'COSMO':
        this.minRate = CONSTANT.COSMO_MIN_RATE;
        this.maxRate = CONSTANT.COSMO_MAX_RATE;
        this.preferredDate.dinnerRate = this.minRate;
        this.preferredDate.cocktailRate = this.minRate;
        this.preferredDate.eventRate = this.minRate;
        this.preferredDate.videoChatRate = this.minRate;
        break;
      case 'CLASSY':
        this.minRate = CONSTANT.CLASSY__MIN_RATE;
        this.maxRate = CONSTANT.CLASSY__MAX_RATE;
        this.preferredDate.dinnerRate = this.minRate;
        this.preferredDate.cocktailRate = this.minRate;
        this.preferredDate.eventRate = this.minRate;
        this.preferredDate.videoChatRate = this.minRate;
        break;
      case 'LUXE':
        this.minRate = CONSTANT.LUXE__MIN_RATE;
        this.maxRate = 10000000;
        this.preferredDate.dinnerRate = this.minRate;
        this.preferredDate.cocktailRate = this.minRate;
        this.preferredDate.eventRate = this.minRate;
        this.preferredDate.videoChatRate = this.minRate;
        break;
      default:
        break;
    }
  }

  changeLevel(value: string) {
    this.preferredDate.level = value;
    this.setRate(value);
  }

  saveDateAndRate() {

    this.errorMessage = '';
    this.validations();

    if (this.errorMessage === '') {
      this.loaderService.display(true);
      const requestObject = {
        preferredDate: {},
        xclusiveLevel: this.preferredDate.level
      };

      if (this.preferredDate.dinner) {
        requestObject.preferredDate['Dinner'] = this.preferredDate.dinnerRate
      }
      if (this.preferredDate.cocktail) {
        requestObject.preferredDate['Cocktails'] = this.preferredDate.cocktailRate
      }
      if (this.preferredDate.specialEvent) {
        requestObject.preferredDate['Special Event'] = this.preferredDate.eventRate
      }
      if (this.preferredDate.videoChat) {
        requestObject.preferredDate['Video Chat'] = this.preferredDate.videoChatRate
      }
      if(Object.keys(requestObject.preferredDate).length > 3){
        this.loaderService.display(false);
        this.messageSevice.open('error', '', MESSAGE.DATES_LIMIT_ERROR, false, '');
      } else {
        this.myProfile.dateAndRate = requestObject;
        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).set(this.myProfile).then((response: any) => {
          this.updateUserDetails().then((response) => {
            this.loaderService.display(false);
            if (this.myProfile.isProfileCompleted) {
              this.router.navigate(['options']);
            } else {
              this.router.navigate(['options/interest']);
            }
          })
        })
      }
    }
  }

  checkPreferredDate(date) {
    if (date == 'dinnerRate') {
      this.preferredDate.dinnerRate = this.minRate;
    } else if (date == 'cocktailRate') {
      this.preferredDate.cocktailRate = this.minRate;
    } else if (date == 'videoChatRate') {
      this.preferredDate.videoChatRate = this.minRate;
    } else {
      this.preferredDate.eventRate = this.minRate;
    }
  }

}
