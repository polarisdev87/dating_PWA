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
  selector: 'app-feed-detail',
  templateUrl: './feed-detail.component.html',
  styleUrls: ['./feed-detail.component.scss']
})
export class FeedDetailComponent extends UserAppComponent implements OnInit {

  title: string = 'NAME';
  leftBtn = true;
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
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        let isCurrentLink = this.router.url.includes('feed-detail');
        if (!isCurrentLink) {
          if (this.activeUserSubscribe) {
            this.activeUserSubscribe.unsubscribe();
          }
        }
      }
    });
  }

  ngOnInit() {
    this.chatService.setActiveInactiveUser();
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.fetchUserDetails().then(value => {
      this.myProfile = value;
      this.isMale = this.myProfile.gender.toUpperCase() == 'MALE';
      this.loaderService.display(true);
      this.route.paramMap.subscribe(params => {
        this.firebaseDBService.database
          .ref()
          .child(DBREFKEY.USERS)
          .child(this.route.snapshot.params.id)
          .once('value', async (snapshot) => {
            this.feedUser = snapshot.val();
            this.setUserActiveStatus();
            let setUserStatus = await this.initUserStatus();
            this.title = this.feedUser.alias.trim();
            const assetsURL = '../../../assets/images/';
            this.verify = {
              google: assetsURL + (this.feedUser.isGoogleVerified ? 'google-verified.png' : 'google-verify.png'),
              id: assetsURL + (this.feedUser.isGovernmentIDVerified ? 'id-verified.png' : 'id-verify.png'),
              email: assetsURL + (this.feedUser.isEmailVerified ? 'email-verified.png' : 'email-verify.png'),
              phone: assetsURL + (this.feedUser.isPhoneVerified ? 'phone-verified.png' : 'phone-verify.png')
            }
            if (this.myProfile.favorites && (this.myProfile.favorites.includes(this.feedUser.id) || this.myProfile.favorites.includes(this.feedUser.uid))) {
              this.feedUser.isFavorite = true;
            } else {
              this.feedUser.isFavorite = false;
            }
            if (this.feedUser.isFavorite) {
              this.rgtIcon = 'favorite_active.png';
            } else {
              this.rgtIcon = 'favorite_inactive.png';
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

            this.feedUser.distance = this.calcCrow(this.myProfile.latitude, this.myProfile.longitude, this.feedUser.latitude, this.feedUser.longitude);
            this.feedUser.zodiacSignIcon = this.getEmojiSymbolForZodiacSign(this.feedUser.zodiacSign);
            this.feedUser.isMale = this.feedUser.gender.toUpperCase() == 'MALE';
            this.loaderService.display(false);
          });
      });
    });
  }

  back() {
    if (this.router.url.includes('favorite')) {
      this.router.navigate(['favorite']);
    } else if (this.router.url.includes('accept-date')) {
      this.router.navigate(['accept-date', this.route.snapshot.params.dateId]);
    } else if (this.router.url.includes('chat')) {
      let chatId = this.route.snapshot.params['chatId'];
      this.router.navigate(['chat', chatId]);
    } else if (this.router.url.includes('dates-details')) {
      let dateId = this.route.snapshot.params['dateId'];
      this.router.navigate(['dates-details', dateId]);
    } else {
      this.router.navigate(['feed']);
    }
  }

  right() {
    if (this.feedUser.isFavorite) {
      this.confirmService.openConfirm('error', 'Are you sure you want to remove "' + this.feedUser.alias.trim() + '" from your favorites?', this.confirm, this.cancel, this);
    } else {
      this.addToFavoriate(this.feedUser);
      this.feedUser.isFavorite = true;
      this.rgtIcon = 'favorite_active.png';
    }
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

  addToFavoriate(user) {
    if (!this.myProfile.favorites) {
      this.myProfile.favorites = [];
    }
    if (user.id == '') {
      this.myProfile.favorites.push(user.uid);
    } else {
      this.myProfile.favorites.push(user.id);
    }
    user.isFavorite = true;
    let gender = this.isMale ? 'male' : 'female';
    this.sendNotificationService.sendFavoriateYouNotification(user.id, this.myProfile);
    this.sendSmsService.sendFavoriateYouSms(user, this.myProfile);
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).update(this.myProfile).then((data: any) => {
      this.updateUserDetails().then(response => {
      })
    }, (error) => {
    }).catch((error) => {
    });
  }

  removeFromFavoriate(user) {
    this.loaderService.display(true);
    if (user.id == '') {
      const index = this.myProfile.favorites.indexOf(user.uid)
      if (index > -1) {
        this.myProfile.favorites.splice(index, 1);
      }
    } else {
      const index = this.myProfile.favorites.indexOf(user.id)
      if (index > -1) {
        this.myProfile.favorites.splice(index, 1);
      }
    }
    user.isFavorite = false;
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).update(this.myProfile).then((data: any) => {
      this.updateUserDetails().then(response => {
        this.feedUser.isFavorite = false;
        this.rgtIcon = 'favorite_inactive.png';
        this.loaderService.display(false);
      })
    }, (error) => {
      this.loaderService.display(false);
    }).catch((error) => {
      this.loaderService.display(false);
    });
  }

  dateHer() {
    if (this.myProfile.isEmailVerified) { //&& this.myProfile.isFacebookVerified && this.myProfile.isPhoneVerified){
      this.router.navigate(['/feed-detail/date-her/', this.feedUser.id, 1]);
      // if(this.myProfile.stripe.default_stripe_source != "" && this.myProfile.stripe.default_stripe_source != undefined){
      //   this.router.navigate(['/feed-detail/date-her/', this.feedUser.id, 1]);
      // } else {
      //   this.confirmService.openConfirm('error', 'Payment method is required to book a date.', this.confirm, this.cancel, this);
      // }
    }
    else {
      this.confirmService.openConfirm('error', 'Facebook Id,Phone and Email are required to book a date.', this.confirm, this.cancel, this);
    }
  }

  confirm(that) {
    that.removeFromFavoriate(that.feedUser);
  }

  cancel() { }

  messageHim() {
    let isMatchFound = this.isMatchedInProfile();
    if (isMatchFound.status === true) {
      this.router.navigate(['/chat/', isMatchFound.convoId]);
    } else {
      this.chatService.addChat(this.myProfile, this.feedUser);
    }
  }

  isMatchedInProfile() {
    let response = {
      status: false,
      convoId: ''
    }
    let userMatches = this.myProfile.matches;
    let feedUserId = this.feedUser.uid.toString();
    if (userMatches && feedUserId in userMatches) {
      response.status = true;
      response.convoId = userMatches[feedUserId].convoId;
    }
    return response;
  }

  setUserActiveStatus() {
    this.activeUserRef = this.firebaseDBService.list(`activeUsers`);
    this.activeUserSubscribe = this.activeUserRef.snapshotChanges().subscribe(async actions => {
      let routeLink = this.router.url.split('/');
      if (routeLink[1] === 'feed-detail' || routeLink[2] === 'feed-detail') {
        if (actions.length > 0) {
          this.initUserStatus();
        }
      }
    });
  }

  initUserStatus(){
    return new Promise(async (resolve,reject) =>{
      let getActiveUsers: any = await this.chatService.getActiveUsersData();
      if (getActiveUsers.status === 1) {
        let activeUsers = getActiveUsers.data;
        let data = activeUsers[this.feedUser.id];
        if(data){
          this.feedUserStatus = data.status ? data.status : false;
        }
      }
      return resolve(true);
    })
  }
}
