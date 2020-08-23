import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFireDatabase } from '@angular/fire/database';
import { CONSTANT } from '@shared/constant';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { environment } from '../../environments/environment';
const defaultPhoneCode = CONSTANT.DEFAULT_PHONENUMBER_CODE;
const FIREBASE_KEYS = environment.FIREBASE_KEYS;
const ENV = environment.ENV;
let firebaseUrl = FIREBASE_KEYS.firebaseUrlLive;
let frontUrl = FIREBASE_KEYS.frontUrlLive;
if(ENV === "local"){
    firebaseUrl =  FIREBASE_KEYS.firebaseUrlLive;
    frontUrl = FIREBASE_KEYS.frontUrlLive;
}
const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': "*"
    })
};

@Injectable()
export class SendSmsService {

    constructor(
        private http: HttpClient,
        public firebaseDBService: AngularFireDatabase
    ) {

    }

    // sendGetMoreRequestCronJob(data) {
    //     console.log("Cron Job add start");
    //     let url =  firebaseUrl + '/addCronJobInQueue';
    //     let body = {
    //         data: {
    //             "type": "getMoreDates",
    //             "phoneNumber": data.phoneNumber,
    //             "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
    //             "redirectionLink": frontUrl +  "/feed-detail/" + data.userId,
    //             "receiverId": data.receiverId,
    //             "senderId": data.senderId,
    //             "dateId": data.dateId 
    //         }
    //     };
    //     this.http.post(url, body, httpOptions).subscribe(
    //         val => {
    //             console.log("Cron Job added",val);
    //         }, () => {
    //             return true;
    //         }
    //     );
    // }

    async sendDateRequestCronJob(data) {
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(data.receiverId);
        let body = {
            data: {
                "type": "dateRequest",
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "senderName": data.senderName,
                "token":getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    async sendFavoriateYouSms(receiver,sender) {
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(receiver.id);
        let body = {
            data: {
                "type": "favoriteYou",
                "phoneNumber": receiver.phoneNumber,
                "phoneNumberCode": receiver.phoneNumberCode ? receiver.phoneNumberCode : defaultPhoneCode,
                "senderName": sender.alias ? sender.alias : 'Alias',
                "token": getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    sendDateAwaitingReviewCronJob(data) {
        let url =  firebaseUrl + '/addCronJobInQueue';
        let body = {
            data: {
                "type": "dateAwaitingReview",
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "senderName": data.senderName,
                "receiverId": data.receiverId,
                "dateId": data.dateId 
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    async sendDateCancelledCronJob(data) {
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(data.receiverId);
        let body = {
            data: {
                "type": "dateCancelled",
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "senderName": data.senderName,
                "gender": data.gender,
                "token":getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    async sendDateAcceptedSms(data){
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(data.receiverId);
        let body = {
            data: {
                "type": "dateAccepted",
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "senderName": data.senderName,
                "token":getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    async sendDateDeclinedSms(data){
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(data.receiverId);
        let body = {
            data: {
                "type": "dateDeclined",
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "senderName": data.senderName,
                "token":getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    sendDateRemainderSms(data){
        let url =  firebaseUrl + '/addCronJobInQueue';
        let body = {
            data: {
                "type": data.type,
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "remainderDate": data.remainderDate,
                "dateType": data.dateType ? data.dateType : '',
                "receiverId": data.receiverId,
                "senderId": data.senderId ? data.senderId : '',
                "dateId": data.dateId 
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    async sendDateStartedSms(data){
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(data.receiverId);
        let body = {
            data: {
                "type": "dateStarted",
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "token":getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    sendDateFinishedSms(data){
        let url =  firebaseUrl + '/addCronJobInQueue';
        let body = {
            data: {
                "type": "rateYourDate",
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "receiverId": data.receiverId,
                "senderId": data.senderId,
                "dateId": data.dateId 
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    async sendInviteFriendsSms(data){
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(data.receiverId);
        let body = {
            data: {
                "type": "inviteFriends",
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "token":getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    async sendPaymentApprovedOrDeclinedSms(data){
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(data.receiverId);
        let body = {
            data: {
                "type": data.type,
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "senderName": data.senderName,
                "paymentDateTime": data.paymentDateTime,
                "token":getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    sendVerifyPhoneSms(data){
        let url =  firebaseUrl + '/verifyPhone';
        let body = {
            data: {
                "userId":data.userId
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    sendXcodeSms(data){
        return new Promise((resolve, reject) => {
            let url =  firebaseUrl + '/sendXcodeSms';
            let body = {
                data: {
                    "phoneNumber":data.phoneNumber,
                    "code":data.code,
                    "name":data.name,
                    // "redirectionLink":FIREBASE_KEYS.frontUrlLive +  "/x-code"
                    "redirectionLink": "http://bit.ly/2SQ2Nym"
                }
            };
            this.http.post(url, body, httpOptions).subscribe(
                val => {
                    return resolve(true);
                }
            );
        })
    }

    async sendChatInitMessage(data){
        let url =  firebaseUrl + '/sendDirectSmsToUser';
        let getUserDataToken: any = await this.fetchUserToken(data.receiverId);
        let body = {
            data: {
                "type": data.type,
                "phoneNumber": data.phoneNumber,
                "phoneNumberCode": data.phoneNumberCode ? data.phoneNumberCode : defaultPhoneCode,
                "senderName": data.senderName,
                "token":getUserDataToken ? getUserDataToken : ""
            }
        };
        this.http.post(url, body, httpOptions).subscribe(
            val => {
                console.log("Cron Job added",val);
            }, () => {
                return true;
            }
        );
    }

    fetchUserToken(userId){
        return new Promise((resolve, reject) => {
            if(userId == undefined || userId == ''){ return resolve("") }
            else {
                this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userId).once('value', (snapshot) => {
                    let tokenData = snapshot.val();
                    if(tokenData && tokenData.fcmToken){
                        return resolve(tokenData.fcmToken);
                    } else {
                        return resolve("");
                    }
                }).catch((error) => {
                    return resolve("");
                });
            }
        })
    }
}