import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService, ChatService, SendSmsService } from 'src/app/services';
import { AngularFireDatabase, snapshotChanges } from '@angular/fire/database';
import { UserAppComponent } from '@shared/component';
import * as moment from 'moment';
import { FireBaseLocalService } from 'src/app/services/firebaselocal.service'
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import * as Lodash from 'lodash';
import { CONSTANT } from '@shared/constant';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent extends UserAppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messageTextId', { static: false }) messageTextId: ElementRef;
  @ViewChild('chatBody', { static: false }) chatBody: ElementRef;
  title: string = '';
  rgtIcon: string = 'eclipse_menu_icon.png';
  leftBtn = true;
  conversationId;
  messages = [];
  localMessages = [];
  myProfile;
  chatUserProfile;
  myProfileMediaUrl;
  chatUserMediaUrl;
  messageText;
  chatRef;
  chatEvents: Array<any> = [];
  chatUserStatus;
  activeUserSubscribe;
  activeUserRef;
  conversationData;
  subscriptions: Array<Subscription> = [];

  constructor(
    private router: Router,
    public firebaseLocalService: FireBaseLocalService,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public sendSmsService: SendSmsService,
    private route: ActivatedRoute,
    private chatService: ChatService,
    public firebaseDBService: AngularFireDatabase) {
    super(loaderService, false, firebaseService, firebaseDBService);
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        let isCurrentLink = this.router.url.includes('chat');
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
    this.conversationId = this.route.snapshot.params['id'];
    this.fetchUserDetails().then( async value => {
      this.myProfile = value;
      let removeChatRemainder = await this.removeChatRemainderMessage();
      this.getConverstions();
    });
    this.chatRef = this.firebaseDBService.list(`convos/${this.conversationId}/message`);
    this.subscriptions.push(this.chatRef.snapshotChanges()
      .subscribe(actions => {
        let routeLink = this.router.url.split('/');
        if (routeLink[1] === 'chat') {
          if (actions.length > 0) {
            if (actions[actions.length - 1].type === 'child_added') {
              let messageData = actions[actions.length - 1].payload.val();
              if (messageData.senderId != this.myProfile.id) {
                let keys = Object.keys(this.localMessages);
                let lastKey = keys[keys.length - 1];
                let lastMessageArray = this.localMessages[lastKey];
                let lastMessage = lastMessageArray[lastMessageArray.length - 1];
                if (lastMessage != undefined && messageData != undefined) {
                  if (lastMessage.timestamp != messageData.timestamp) {
                    this.localMessages[lastKey].push(messageData);
                    this.messages.push(messageData);
                  }
                } else {
                  this.localMessages[lastKey].push(messageData);
                  this.messages.push(messageData);
                }
              }
            }
          }
        }
        this.letScrollToBottom();
      }));
  }

  ngAfterViewInit() {
    let that = this;
    that.messageTextId.nativeElement.addEventListener("keydown", function (e) {
      that.letScrollToBottom();
    });
    that.messageTextId.nativeElement.addEventListener("focus", function (e) {
      that.letScrollToBottom();
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe())
  }

  back() {
    this.router.navigate(['message']);
  }

  getConverstions() {
    this.firebaseDBService.database
      .ref()
      .child('convos')
      .child(this.conversationId)
      .once('value', async (snapshot) => {
        this.loaderService.display(true);
        this.localMessages = [];
        if (snapshot.val() != null && snapshot.val() !== undefined) {
          this.conversationData = snapshot.val();
          if (snapshot.val().message && snapshot.val().message.length > 0) {
            this.messages = snapshot.val().message;
            this.localMessages = snapshot.val().message;
            let filterChatMessagesData = await this.filterChatMessages();
            if (this.localMessages.length > 0) {
              this.localMessages = Lodash.groupBy(this.localMessages, function (date) {
                return moment(date.timestamp).startOf('day').format();
              });
            }
          }
        }
        let setLocalMessages = await this.setCurrentDateInLocalMessages();
        let userId = this.myProfile.uid;
        let feedUserId = snapshot.val().userId1;
        if (userId === snapshot.val().userId1) {
          feedUserId = snapshot.val().userId2;
        }
        this.firebaseDBService.database.ref(DBREFKEY.USERS).child(feedUserId).once('value', async (snapshot) => {
          this.loaderService.display(true);
          if (snapshot.val() !== null) {
            this.chatUserProfile = snapshot.val();
            this.title = this.chatUserProfile.alias;
            this.chatEvents = CONSTANT.CHAT_EVENTS;
            if (this.chatUserProfile.profileMedia && this.chatUserProfile.profileMedia.length > 0) {
              this.chatUserMediaUrl = this.chatUserProfile.profileMedia[0].mediaURL;
            }
            if (this.myProfile.profileMedia && this.myProfile.profileMedia.length > 0) {
              this.myProfileMediaUrl = this.myProfile.profileMedia[0].mediaURL;
            }
          }
          this.setUserActiveStatus();
          let setUserStatus = await this.initUserStatus();
          this.loaderService.display(false);
        });
      }).catch((error) => {
        this.loaderService.display(false);
      });
  }

  async onMessageSend() {
    this.messageTextId.nativeElement.focus();
    if (this.messageText && this.messageText.length > 0) {
      const params = {
        content: this.messageText,
        senderId: this.myProfile.id,
        timestamp: Date.now()
      };
      let updateLatestMessages = await this.getLatestMessages();
      this.messages.push(params);
      let keys = Object.keys(this.localMessages);
      let lastKey = keys[keys.length - 1];
      this.localMessages[lastKey].push(params);
      this.messageText = '';
      this.firebaseDBService.database.ref()
        .child('convos')
        .child(this.conversationId)
        .child('message')
        .update(this.messages)
        .then(async (res) => {
          let chatUserId = this.chatUserProfile.uid;
          this.updateMatchToUsers(params, params.senderId, chatUserId);
          this.updateMatchToUsers(params, chatUserId, params.senderId);
          let sendIdleMessageData = await this.sendIdleMessage(chatUserId);
          let sendChatRemainderData = await this.setChatRemainderMessage(chatUserId);
          let refreshData = await this.chatService.refreshMeData(params.senderId);
        });
    }
    //this.sendPushNotification();
  }

  updateMatchToUsers(data, parent, child) {
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(parent).child('matches')
      .child(child).update({
        'lastMessageReceived': data.content,
        'timeLastMessageReceived': data.timestamp,
        'isDeleted': false
      });
  }

  sendPushNotification() {
    this.firebaseLocalService.sendPush();
  }

  chatEventCalled(event) {
    if (event.statusValue === "Block User") {
      this.blockUser();
    } else if (event.statusValue === "Report User") {
      this.router.navigate(['report-problem']);
    } else if (event.statusValue === "Delete Conversation") {
      this.deleteConversation();
    }
  }

  blockUser() {
    this.loaderService.display(true);
    const that = this;
    let blockObj = {};
    const date = moment(new Date(), 'MM-DD-YYYY').format('MM/DD/YY');
    blockObj['id'] = this.chatUserProfile.id;
    blockObj['name'] = this.chatUserProfile.alias;
    blockObj['date'] = date;
    if (!this.myProfile.blockedProfiles) {
      this.myProfile.blockedProfiles = [];
    }
    this.myProfile.blockedProfiles.push(blockObj);

    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.id).set(this.myProfile).then((data: any) => {
      this.updateUserDetails().then(response => {
      })
    }, (error) => {
      this.loaderService.display(false);
    }).catch((error) => {
      this.loaderService.display(false);
    }).then(() => {
      that.updateMaleProfile();
    })
  };

  async updateMaleProfile() {
    this.loaderService.display(true);
    const date = moment(new Date(), 'MM-DD-YYYY').format('MM/DD/YY');
    let updateUser = await this.firebaseDBService.database.ref()
    .child(DBREFKEY.USERS).child(this.chatUserProfile.id).child('whoBlockedYou')
    .child(this.myProfile.id).update({ 'name': this.myProfile.alias, 'date': date });
    this.loaderService.display(false);
    this.router.navigate(['options/blocked-profile']);
  }

  async deleteConversation() {
    let conversationId = this.conversationId;
    let userId1 = this.myProfile.id;
    let userId2 = this.chatUserProfile.id;
    let removeUser1 = await this.removeMatchFromUsers(userId1, userId2);
    //let removeUser2 = await this.removeMatchFromUsers(userId2, userId1);
    //let removeConversation = await this.removeConvoId(conversationId);
    if (this.messages.length > 0) {
      let removeMessage = await this.removeMessageByUsers(userId1);
    }
    let refreshData = await this.chatService.refreshMeData(userId1);
    this.router.navigate(['message']);
  }

  removeMessageByUsers(userId) {
    return new Promise(async (resolve, reject) => {
      let setObject;
      if (userId === this.conversationData.userId2) {
        setObject = { isDeletedByUser2: true };
      } else {
        setObject = { isDeletedByUser1: true };
      }
      let setChatMessagesData = await this.setChatMessages(setObject);
      return resolve(true);
    })
  }

  setChatMessages(setObject) {
    return new Promise(async (resolve, reject) => {
      let cnt = 0;
      let updatedMesages = [];
      let updateLatestMessages = await this.getLatestMessages();
      for (let index = 0; index < this.messages.length; index++) {
        const element = this.messages[cnt];
        let keys = Object.keys(setObject);
        element[keys[0]] = setObject[keys[0]];
        updatedMesages.push(element);
        cnt = cnt + 1;
        if (cnt === this.messages.length) {
          var rootRef = this.firebaseDBService.database.ref();
          var convoRef = rootRef.child('convos');
          let updateData = await convoRef.child(this.conversationId).update({ "message": updatedMesages });
          return resolve(true);
        }
      }
    })
  }

  filterChatMessages() {
    return new Promise((resolve, reject) => {
      let setCondition;
      if (this.myProfile.id === this.conversationData.userId2) {
        setCondition = "isDeletedByUser2";
      } else {
        setCondition = "isDeletedByUser1";
      }
      var filteredArray = this.localMessages.filter(function (item) {
        if (item[setCondition] === true) {
          return false;
        } else {
          return true;
        }
      });
      this.localMessages = filteredArray;
      return resolve(true);
    })
  }

  // removeConvoId(convoId) {
  //   return new Promise((resolve, reject) => {
  //     var rootRef = this.firebaseDBService.database.ref();
  //     var convoRef = rootRef.child('convos');
  //     convoRef.child(convoId).remove().then(result => {
  //       return resolve(true);
  //     });
  //   })
  // }

  removeMatchFromUsers(parent, child) {
    return new Promise((resolve, reject) => {
      var rootRef = this.firebaseDBService.database.ref();
      var convoRef = rootRef.child('users').child(parent).child('matches');
      convoRef.child(child).update({ 'isDeleted': true }).then(result => {
        return resolve(true);
      });
    })
  }

  setCurrentDateInLocalMessages() {
    let that = this;
    return new Promise((resolve, reject) => {
      let keys = Object.keys(that.localMessages);
      let lastKey = keys[keys.length - 1];
      let date = new Date(lastKey);
      let checkDate = that.isTodayDate(date);
      if (checkDate === false) {
        let currentDate = moment().startOf('day').format();
        that.localMessages[currentDate] = [];
      }
      return resolve(true);
    })
  }

  isTodayDate(someDate) {
    const today = new Date()
    someDate = new Date(someDate);
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
  }

  letScrollToBottom() {
    let height = this.chatBody.nativeElement.scrollHeight;
    setTimeout(() => {
      window.scrollTo(0, height);
    }, 1)
  }

  setUserActiveStatus() {
    this.activeUserRef = this.firebaseDBService.list(`activeUsers`);
    this.activeUserSubscribe = this.activeUserRef.snapshotChanges().subscribe(async actions => {
      let routeLink = this.router.url.split('/');
      if (routeLink[1] === 'chat') {
        if (actions.length > 0) {
          this.initUserStatus();
        }
      }
    });
  }

  initUserStatus() {
    return new Promise(async (resolve, reject) => {
      let getActiveUsers: any = await this.chatService.getActiveUsersData();
      if (getActiveUsers.status === 1) {
        let activeUsers = getActiveUsers.data;
        let data = activeUsers[this.chatUserProfile.id];
        if (data) {
          this.chatUserStatus = data.status ? data.status : false;
        }
      }
      return resolve(true);
    })
  }

  feedDetail(userId) {
    this.router.navigate(['/chat/feed-detail', userId, this.conversationId]);
  }

  profilePage() {
    this.router.navigate(['/my-profile']);
  }

  getLatestMessages() {
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database
        .ref()
        .child('convos')
        .child(this.conversationId)
        .once('value', async (snapshot) => {
          if (snapshot.val() != null && snapshot.val() !== undefined) {
            this.conversationData = snapshot.val();
            if (snapshot.val().message && snapshot.val().message.length > 0) {
              this.messages = snapshot.val().message;
            }
          }
          return resolve(true);
        })
    })
  }

  sendIdleMessage(userId) {
    return new Promise(async (resolve, reject) => {
      let checkInitDate: any = await this.checkChatInitDate();
      if(checkInitDate.status === 3){ return resolve(true); } 
      let getActiveUserData: any = await this.getActiveDataOfUser(userId);
      if(getActiveUserData.status === 3){ return resolve(true); }
      if(getActiveUserData.data.status === false){
        let currentTime = Date.now();
        let updateChatInitDate = await this.firebaseDBService.database.ref()
        .child('convos').child(this.conversationId).update({'initMessageDate':currentTime})
        this.conversationData.initMessageDate = currentTime;
        let smsObject = {
          type:"chatInitSms",
          phoneNumber:this.chatUserProfile.phoneNumber,
          phoneNumberCode:this.chatUserProfile.phoneNumberCode,
          receiverId:this.chatUserProfile.id,
          senderName:this.myProfile.alias,
        }
        let sendChatInitMessage = await this.sendSmsService.sendChatInitMessage(smsObject);
        return resolve(true);
      } else {
        return resolve(true);
      } 
    })
  }

  checkChatInitDate(){
    return new Promise((resolve, reject) => {
      let initDate = this.conversationData.initMessageDate;
      if(initDate == "" || initDate == undefined){ return resolve({status:1}); }
      let checkDate = this.isTodayDate(initDate);
      if (checkDate === false) {
        return resolve({status:1});
      } else {
        return resolve({status:3});
      }
    })
  }

  getActiveDataOfUser(userId) {
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database.ref(DBREFKEY.ACTIVEUSERS).child(userId).once('value', (snapshot) => {
        if (snapshot.val() !== null) {
          let user = snapshot.val();
          if (user == undefined || user == '') {
            return resolve({ status: 3 });
          }
          return resolve({ status: 1, data: user });
        }
      })
    })
  }

  setChatRemainderMessage(userId) {
    return new Promise(async (resolve, reject) => {
      let getActiveUserData: any = await this.getActiveDataOfUser(userId);
      if(getActiveUserData.status === 3){ return resolve(true); }
      if(getActiveUserData.data.status === true){ return resolve(true); }
      // If user is Inactive
      let getChatRemainder : any = await this.getChatRemainderDetails(userId);
      if(getChatRemainder.status === 3){ return resolve(true); }
      // If chat remainder not added
      let setChatRemainder = await this.firebaseDBService.database.ref()
      .child(DBREFKEY.CHATREMAINDERS).child(userId).update(getChatRemainder.data);
    })
  }

  getChatRemainderDetails(userId){
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database.ref().child(DBREFKEY.CHATREMAINDERS)
      .child(userId)
      .once('value', async (snapshot) => {
        let chatRemainder = snapshot.val();
        if(chatRemainder != undefined && chatRemainder != '' && chatRemainder.length > 0){
          var chatFound = chatRemainder.includes(this.conversationId);
          if(chatFound){
            return resolve({status:3});
          } else {
            chatRemainder.push(this.conversationId);
            return resolve({status:1,data:chatRemainder});
          }
        } else {
          return resolve({status:1,data:[this.conversationId]});
        }
      })
    })
  }

  removeChatRemainderMessage() {
    return new Promise(async (resolve, reject) => {
      let setChatRemainder = await this.firebaseDBService.database.ref()
      .child(DBREFKEY.CHATREMAINDERS).child(this.myProfile.id).remove();
      return resolve(true);
    })
  }
}