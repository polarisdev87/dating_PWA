import { Component, OnInit, OnDestroy } from "@angular/core";
import { UserAppComponent } from "@shared/component";
import { Router, Event, NavigationEnd } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { LoaderService, ChatService, UserService } from "src/app/services";
import { AngularFireDatabase } from "@angular/fire/database";
import { DBREFKEY } from "@shared/constant/dbRefConstant";
import * as Lodash from "lodash";
import { KeyValue } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.scss"]
})
export class MessageComponent extends UserAppComponent implements OnInit, OnDestroy {
  title: string = "MY MESSAGES";
  myProfile: any;
  avatars: Array<any>;
  leftBtn: boolean;
  conversations = {};
  chatRef;
  msgCnt = -1;
  convRef;
  activeUserSubscribe;
  activeUserRef;
  convo = [];
  showBlankScreen = false;
  subscriptions: Array<Subscription> = [];

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public firebaseDBService: AngularFireDatabase,
    private chatService: ChatService,
    public userService: UserService
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        let isCurrentLink = this.router.url.includes('message');
        if (!isCurrentLink) {
          if (this.activeUserSubscribe) {
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
      this.leftBtn = false;
      this.avatars = [];
      this.fetchUserDetails().then(async value => {
        this.myProfile = value;
        this.updateMessageList();
        this.setUserActiveStatus();
        let messageRef = this.firebaseDBService.list(`convos`);
        this.subscriptions.push(messageRef.stateChanges(["child_removed"]).subscribe(async action => {
          let refreshData  = await this.chatService.refreshMeData(this.myProfile.id);
          this.router.navigate(['message']);
        }));
        if (this.myProfile.profileMedia) {
          this.avatars = this.myProfile.profileMedia.map((x, i) => {
            return {
              url: x.mediaURL
            };
          });
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe())
  }

  updateMessageList() {
    const me = localStorage.getItem("me");
    let userData = JSON.parse(me);
    this.convRef = this.firebaseDBService.list(`users/${userData.uid}/matches`);
    this.subscriptions.push(this.convRef.snapshotChanges().subscribe(async actions => {
      let getActiveUsers: any = await this.chatService.getActiveUsersData();
      let activeUsers = getActiveUsers.data;
      this.convo = [];
      actions.forEach(async action => {
        const conv = action.payload.val();
        if (conv.userId) {
          this.firebaseDBService.database
            .ref()
            .child(DBREFKEY.USERS)
            .child(conv.userId)
            .once("value", async snapshot => {
              const userData = snapshot.val();
              if (userData != null) {
                this.conversations[conv.userId] = conv;
                this.conversations[conv.userId].alias = userData.alias;
                let data = activeUsers[conv.userId];
                if(data){
                  this.conversations[conv.userId].userStatus = data.status ? data.status : false;
                }
                let isBlocked = await this.filterBlockedUser(conv.userId);
                let isUserBlocked = await this.filterUserBlockedUser(conv.userId);
                let isFinalBlocked = false;
                if(isBlocked || isUserBlocked){
                  isFinalBlocked = true;
                }
                this.conversations[conv.userId].isBlocked = isFinalBlocked;
                if (
                  userData &&
                  userData.profileMedia &&
                  userData.profileMedia.length > 0
                ) {
                  this.conversations[conv.userId].profileUrl =
                    userData.profileMedia[0].mediaURL;
                }
                this.convo.push(this.conversations[conv.userId]);
                const item = this.conversations[conv.userId];
                if(item.lastMessageReceived != 'None' && item.isBlocked == false && item.isDeleted != true){
                  this.msgCnt = 1;
                }                 

                this.chatRef = this.firebaseDBService.list(
                  `convos/${conv.convoId}`
                );
                this.subscriptions.push(this.chatRef
                  .snapshotChanges(["child_changed"])
                  .subscribe(chat => {
                    chat.forEach(obj => {
                      // tslint:disable-next-line:no-unused-expression
                      if (obj.key === "message") {
                        const msg = obj.payload.val();
                        if (msg.length > 0) {
                          this.conversations[conv.userId].lastMessageReceived =
                            msg[msg.length - 1].content;
                          this.conversations[
                            conv.userId
                          ].timeLastMessageReceived =
                            msg[msg.length - 1].timestamp;
                        }
                      }
                    });
                  }));
              }
            });
        }
      });
      this.showBlankScreen = true;
    }));
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

  notificationCall(event) {
    this.router.navigate(['/message/notifications']);
  }

  setUserActiveStatus() {
    this.activeUserRef = this.firebaseDBService.list(`activeUsers`);
    this.activeUserSubscribe = this.activeUserRef.snapshotChanges().subscribe(async actions => {
      let routeLink = this.router.url.split('/');
      if (routeLink[1] === 'message') {
        if (actions.length > 0) {
          this.initUserStatus();
        }
      }
    });
  }

  initUserStatus() {
    return new Promise(async (resolve, reject) => {
      let conversations = Object.keys(this.conversations);
      if (conversations.length <= 0) { return resolve(true); }
      let getActiveUsers: any = await this.chatService.getActiveUsersData();
      if (getActiveUsers.status === 1) {
        let activeUsers = getActiveUsers.data;
        let cnt = 0;
        conversations.forEach(value => {
          let userId = value.toString();
          let data = activeUsers[userId];
          if(data){
            this.conversations[value]["userStatus"] = data.status ? data.status : false;
          }
          cnt = cnt + 1;
          if (cnt == conversations.length) {
            return resolve(true);
          }
        })
      }
    })
  }

  valueAscOrder = (a: KeyValue<any, any>, b: KeyValue<any, any>) => {
    // return a.value.timeLastMessageReceived > b.value.timeLastMessageReceived ? -1 : (b.value.timeLastMessageReceived > a.value.timeLastMessageReceived ? 1 : 0);
    // return b.value.timeLastMessageReceived - a.value.timeLastMessageReceived;
    // return a.value.timeLastMessageReceived.localeCompare(b.value.timeLastMessageReceived);
  }
}
