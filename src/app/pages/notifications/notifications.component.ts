import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { UserAppComponent } from '@shared/component';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { MessageModalComponent } from 'src/app/components';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent extends UserAppComponent implements OnInit {

  title: string = 'NOTIFICATIONS';
  leftBtn = true;
  notifications = [];
  myProfile: any;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    private messageService: MessageModalComponent,
    public loaderService: LoaderService,
    public firebaseDBService: AngularFireDatabase) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('me'));
    if (user.isApproved === false) {
      location.href = '/finish-profile';
    }
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.fetchNotificationData();
    localStorage.setItem('notificationAlert','no');
  }

  fetchNotificationData() {
    this.fetchUserDetails().then(async value => {
      this.myProfile = value;
      this.loaderService.display(true);
      let getNotifications: any = await this.getNotificationById(this.myProfile.id);
      if (getNotifications.status === 3) { 
        this.loaderService.display(false);
        return false;
      }
      let setNotificationData: any = await this.setNotificationData(getNotifications.data);
      // this.notifications = setNotificationData;
      this.loaderService.display(false);  
    });
  }

  getNotificationById(id) {
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database.ref().child(DBREFKEY.NOTIFICATION)
        .child(id).orderByChild('timestamp').once('value', (snapshot) => {
          let result = snapshot.val();
          if (!result) { return resolve({ 'status': 3 }); }
          return resolve({ 'status': 1, 'data': result });
        });
    })
  }

  compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }
  
      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }

  setNotificationData(data) {
    return new Promise(async (resolve, reject) => {
      const dataKeys = Object.keys(data);
      let cnt = 0;
      //let responseArray = [];
      for (let i = 0; i < dataKeys.length; i++) {
        let notiData = data[dataKeys[cnt]];
        let imageUrl;
        if(notiData.senderId != '' && notiData.senderId != undefined){
          imageUrl = await this.getSenderImageUrl(notiData.senderId);
        }else{
          imageUrl = "../../../assets/images/no-data.png";
        }
        let responseData = {
          id: notiData.id,
          mediaURL: imageUrl ? imageUrl : '',
          message: notiData.message,
          senderId: notiData.senderId,
          timestamp: notiData.timestamp
        }
        //responseArray.push(responseData);
        this.notifications.push(responseData);
        cnt = cnt + 1;
        if (cnt === dataKeys.length) {
          //responseArray.sort(this.compareValues('timestamp','desc'));
          this.notifications.sort(this.compareValues('timestamp','desc'));
          return resolve(true);
        }
      }
    })
  }

  getSenderImageUrl(id) {
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS)
        .child(id).once('value', (snapshot) => {
          let result = snapshot.val();
          if(result && result.profileMedia && result.profileMedia.length > 0){
            return resolve(result.profileMedia[0].mediaURL);
          } else {
            return resolve('');
          }
        });
    })
  }

  back() {
    if (this.router.url.includes('favorite')) {
      this.router.navigate(['favorite']);
    } else if(this.router.url.includes('dates')){
      this.router.navigate(['dates']);
    } else if(this.router.url.includes('feed')){
      this.router.navigate(['feed']);
    } else if(this.router.url.includes('message')){
      this.router.navigate(['message']);
    } else if(this.router.url.includes('my-profile')){
      this.router.navigate(['my-profile']);
    } 
  }

  async profileRedirect(id) {
    if(id){
      let isBlocked = await this.filterBlockedUser(id);
      let isUserBlocked = await this.filterUserBlockedUser(id);
      if(isBlocked == false && isUserBlocked == false ){
        this.router.navigate(['feed-detail/' + id]);
      } else {
        let errorMessage = "Profile has been restricted due to blocking.";
        this.messageService.open('error', '', errorMessage, false, '');
      }
    }
  }

  async clearNotification(selectedId) {
    let removeData = await this.firebaseDBService.database.ref().child(DBREFKEY.NOTIFICATION)
    .child(this.myProfile.id).child(selectedId).remove();
    this.notifications = this.notifications.filter((user) => {
      return user.id != selectedId;
    });
  }

  filterBlockedUser(userId) {
    return new Promise((resolve, reject) => {
      const me = localStorage.getItem("me");
      let userData = JSON.parse(me);
      if (userData != null) {
        let blockedProfiles = userData.blockedProfiles;
        if (blockedProfiles && blockedProfiles.length > 0) {
          let response = false;
          let cnt = 0;
          for (let i = 0; i < blockedProfiles.length; i++) {
            if (blockedProfiles[cnt].id === userId) {
              response = true;
            }
            cnt = cnt + 1;
            if (cnt === blockedProfiles.length) {
              return resolve(response);
            }
          }
        } else {
          return resolve(false);
        }
      }
      else {
        return resolve(false);
      }
    })
  }

  filterUserBlockedUser(userId) {
    return new Promise((resolve, reject) => {
      var flag = false;
      if (this.myProfile.whoBlockedYou) {
        (Object.keys(this.myProfile.whoBlockedYou).map((key) => {
            if (key == userId) {
                flag = true;
            }
        }));
      }
      return resolve(flag);
    })
  }
}
