import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import * as uuid from 'uuid';
import { CONSTANT } from '@shared/constant';
import { environment } from '../../environments/environment';
const ENV = environment.ENV;
const FIREBASE_KEYS = environment.FIREBASE_KEYS;
let frontUrl = FIREBASE_KEYS.frontUrlLive;

@Injectable()
export class SendNotificationService {

    constructor(
        public firebaseDBService: AngularFireDatabase,
    ) {}

    async sendDateRequestNotification(receiverId,senderId,senderName) {
        const firebaseId = uuid.v4();
        //let redirectionUrl = frontUrl + "/dates";
        let data = {
            id: firebaseId,
            message : "Woot-woot! You’ve got a date invite from " + senderName + ". 💖",
            receiverId : receiverId,
            senderId : senderId
        }
        let sendNotification = await this.sendNotification(data);
        return true;
    }

    async sendDateAcceptedNotification(receiverId,senderId,senderName) {
        const firebaseId = uuid.v4();
        //let redirectionUrl = frontUrl + "/dates";
        let data = {
            id: firebaseId,
            message : "Great news! " + senderName + " has accepted your date. 🥂",
            receiverId : receiverId,
            senderId : senderId
        }
        let sendNotification = await this.sendNotification(data);
        return true;
    } 

    async sendDateDeclinedNotification(receiverId,senderId,senderName) {
        const firebaseId = uuid.v4();
        //let redirectionUrl = frontUrl + "/feed";
        let data = {
            id: firebaseId,
            message : "Uh-oh, " + senderName + " has declined your invite. Try a different date and time?",
            receiverId : receiverId,
            senderId : senderId
        }
        let sendNotification = await this.sendNotification(data);
        return true;
    } 

    async sendDateCancelledNotification(receiverId,senderId,senderName,gender) {
        const firebaseId = uuid.v4();
        //let redirectionUrl = frontUrl + '/feed';
        let message = "Oh, bummer! " + senderName + " has cancelled his invite.\nThat time is now free on your calendar. 🗓️Meet someone new?";
        if(gender == 'female'){
            message = "Oh, bummer! " + senderName + " has cancelled the date.\nThat time is now free on your calendar. 🗓️Meet someone new?";
        }
        let data = {
            id: firebaseId,
            message : message,
            receiverId : receiverId,
            senderId : senderId
        }
        let sendNotification = await this.sendNotification(data);
        return true;
    }

    async sendFavoriateYouNotification(receiverId,sender) {
        const firebaseId = uuid.v4();
        //let redirectionUrl = frontUrl + '/favorite/notifications';
        let name = sender.alias ? sender.alias : 'Alias';
        let message = "We see hearts! 💖 " + name + " just favorited you!";
        let data = {
            id: firebaseId,
            message : message,
            receiverId : receiverId,
            senderId : sender.id ? sender.id  : ''
        }
        let sendNotification = await this.sendNotification(data);
        return true;
    }

    async sendDateStartedNotification(receiverId,senderId) {
        const firebaseId = uuid.v4();
        let data = {
            id: firebaseId,
            message : "Date has been started by your date partner. Hope you have a good time.",
            receiverId : receiverId,
            senderId : senderId
        }
        let sendNotification = await this.sendNotification(data);
        return true;
    }

    sendNotification(data) {
        return new Promise(async (resolve,reject) => {
            let addData = await this.firebaseDBService.database.ref()
                .child(DBREFKEY.NOTIFICATION).child(data.receiverId).child(data.id).set({
                'id': data.id,
                'senderId': data.senderId,
                'message': data.message,
                'timestamp': Date.now()
            })
            return resolve(true);
        })
    }
}