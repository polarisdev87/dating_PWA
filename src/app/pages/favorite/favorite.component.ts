import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router, NavigationEnd, Event } from '@angular/router';
import { LoaderService, ChatService, UserService } from 'src/app/services';
import { UserAppComponent } from '@shared/component';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { ConfirmModalComponent } from 'src/app/components';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent extends UserAppComponent implements OnInit {

  title: string = 'MY FAVORITES';
  myProfile: any;
  myFavoriteUsers = [];
  showBlankScreen = false;
  leftBtn = false;
  selectedFavorites: any;
  avatars = [];
  currentYear = new Date().getFullYear();
  activeUserSubscribe;
  activeUserRef;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    private chatService: ChatService,
    private confirmService: ConfirmModalComponent,
    public userService: UserService,
    public firebaseDBService: AngularFireDatabase) {
    super(loaderService, false, firebaseService, firebaseDBService);
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        let isCurrentLink = this.router.url.includes('favorite');
        let isRedirectionLink = this.router.url.includes('favorite/feed-detail');
        if (!isCurrentLink || isRedirectionLink) {
          if(this.activeUserSubscribe){
            this.activeUserSubscribe.unsubscribe();
          }
        }
      }
    });
  }

  async ngOnInit() {
    this.loaderService.display(true);
    let checkUser = await this.userService.checkUserApprovedStatus();
    this.loaderService.display(false);
    if(checkUser === true){
      this.chatService.setActiveInactiveUser();
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      this.fetchUserDetails().then(value => {
        this.myProfile = value;
        this.fetchFavoriteUsers(this.myProfile.gender).then(async (users: any) => {
          if(users && users.length <= 0){ 
            this.setUserActiveStatus();
            this.showBlankScreen = true;
          } else {
            this.loaderService.display(true);
            let cnt = 0;
            users.forEach(async user => {
              this.showBlankScreen = true;
              if (this.myProfile.favorites && (!this.isUserBlockeYou(user.id)) && (this.myProfile.favorites.includes(user.id) || this.myProfile.favorites.includes(user.uid))) {
                user.distance = this.calcCrow(this.myProfile.latitude, this.myProfile.longitude, user.latitude, user.longitude);
                this.myFavoriteUsers.push(user);
              }
              cnt = cnt + 1;
              if(cnt == users.length){
                this.setUserActiveStatus();
                let setUserStatus = await this.initUserStatus();
                this.loaderService.display(false);
              }
            });
          }
        });
      });
    }
  }

  isUserBlockeYou(userId) {
    var flag = false;
    if (this.myProfile.whoBlockedYou) {
      (Object.keys(this.myProfile.whoBlockedYou).map((key) => {
        if (key == userId) {
          flag = true;
        }
      }));
    }
    return flag;
  }

  unFavoriteUsers(user, event) {
    this.selectedFavorites = user;
    this.confirmService.openConfirm('error', 'Are you sure you want to remove "' + user.alias.trim() + '" from your favorites?', this.confirm, this.cancel, this);
    event.stopPropagation();
  }

  chat(user, event) {
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(user.id).once('value', (snapshot) => {
      let matches = snapshot.val().matches;
      let favUserId = this.myProfile.uid.toString();
      if (matches && favUserId in matches) {
        let convoId = matches[favUserId].convoId;
        this.router.navigate(['/chat/', convoId]);
      }
      else {
        this.chatService.addChat(this.myProfile, snapshot.val());
      }
      event.stopPropagation();
    });
  }

  fetchFavoriteUsers(gender) {
    if (gender.toUpperCase() == 'MALE') {
      gender = 'Female';
    } else {
      gender = 'Male';
    }
    return new Promise(resolve => {
      const users = new Subject<string>();
      const queryObservable = users.pipe(
        switchMap(gender =>
          this.firebaseDBService.list(DBREFKEY.USERS, ref => ref.orderByChild('gender').startAt(gender.toUpperCase()).endAt(gender.toLowerCase() + "\uf8ff")).valueChanges()
        )
      );
      queryObservable.subscribe(queriedItems => {
        resolve(queriedItems);
      });
      users.next(gender);
    });
  }

  feedDetail(user) {
    if (user.id == '') {
      this.router.navigate(['/favorite/feed-detail', user.uid]);
    } else {
      this.router.navigate(['/favorite/feed-detail', user.id]);
    }
  }

  confirm(that) {
    that.loaderService.display(true);
    var index = that.myProfile.favorites.indexOf(that.selectedFavorites.id)
    that.myProfile.favorites.splice(index, 1);
    that.myFavoriteUsers = that.myFavoriteUsers.filter((user) => {
      return user.id != that.selectedFavorites.id;
    });
    that.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(that.myProfile.uid).set(that.myProfile).then((data: any) => {
      that.updateUserDetails().then(response => {
        that.selectedFavorites = undefined;
        that.loaderService.display(false);
      })
    }, (error) => {
      that.loaderService.display(false);
    }).catch((error) => {
      that.loaderService.display(false);
    });
  }

  cancel(that) {
    that.selectedFavorites = undefined;
  }

  notificationCall(event) {
    this.router.navigate(['/favorite/notifications']);
  }

  setUserActiveStatus() {
    this.activeUserRef = this.firebaseDBService.list(`activeUsers`);
    this.activeUserSubscribe = this.activeUserRef.snapshotChanges().subscribe(async actions => {
      let routeLink = this.router.url.split('/');
      if (routeLink[1] === 'favorite') {
        if (actions.length > 0) {
          this.initUserStatus();
        }
      }
    });
  }

  initUserStatus(){
    return new Promise(async (resolve,reject) =>{
      if(this.myFavoriteUsers.length <= 0){ return resolve(true); }
      let getActiveUsers: any = await this.chatService.getActiveUsersData();
      if (getActiveUsers.status === 1) {
        let activeUsers = getActiveUsers.data;
        let cnt = 0;
        this.myFavoriteUsers.forEach((value, index) => {
          let userId = value.id.toString();
          let data = activeUsers[userId];
          if(data){
            this.myFavoriteUsers[index]["userStatus"] = data.status ? data.status : false;
          }
            cnt = cnt + 1;
          if(cnt == this.myFavoriteUsers.length){
            return resolve(true);
          }
        })
      }
    })
  }
}
