import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import * as firebase from 'firebase';
import '@firebase/messaging';

@Injectable()
export class MessagingService {

  currentMessage = new BehaviorSubject(null);

  constructor(
    public firebaseDBService: AngularFireDatabase,
    private angularFireAuth: AngularFireAuth,
    private angularFireMessaging: AngularFireMessaging) {
    this.angularFireMessaging.messaging.subscribe(
      (_messaging) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      }
    )
  }

  /**
   * request permission for notification from firebase cloud messaging
   * 
   * @param userId userId
   */
  requestPermission(userId) {
    return new Promise((resolve, reject) => {
      const messaging = firebase.messaging();
      if (navigator.userAgent && !navigator.userAgent.match(/iPhone/i)){
        messaging.requestPermission().then(async () =>{
          let token = await messaging.getToken();
          let setFCMTokenData = await this.setFCMToken(userId,token);
          return resolve(true);
        }).catch((err)=> {
          return resolve(true);
        })
      }else{
        return resolve(true);
      }

      // this.angularFireMessaging.requestToken.subscribe(
      //   async (token) => {
      //     let setFCMTokenData = await this.setFCMToken(userId,token);
      //     return resolve(true);
      //   },
      //   (err) => {
      //     console.error('Unable to get permission to notify.', err);
      //     return resolve(true);
      //   }
      // );
    })
  }

  setFCMToken(userId,token){
    return new Promise(async (resolve, reject) => {
      let updateData = await this.firebaseDBService.database.ref()
        .child(DBREFKEY.USERS).child(userId).update({'fcmToken':token})
    })
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        this.currentMessage.next(payload);
      })
  }
}