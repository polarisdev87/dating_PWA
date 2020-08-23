import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { UserAppComponent } from '@shared/component';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService, SendSmsService, ChatService, SendNotificationService, PaymentService, VideoChatService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import * as moment from 'moment';
import { MessageModalComponent } from 'src/app/components';
import { User } from '@shared/interface';
import * as firebase from 'firebase/app';
import '@firebase/functions';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmModalComponent } from 'src/app/components';
import { CONSTANT } from '@shared/constant';
import { environment } from '../../../environments/environment';
const FIREBASE_KEYS = environment.FIREBASE_KEYS;
const ENV = environment.ENV;
let firebaseUrl = FIREBASE_KEYS.firebaseUrlLive;
let frontUrl = FIREBASE_KEYS.frontUrlLive;
if(ENV === "local"){
    firebaseUrl =  FIREBASE_KEYS.firebaseUrlLive;
    frontUrl = FIREBASE_KEYS.frontUrlLive;
}

@Component({
  selector: 'app-accept-date',
  templateUrl: './accept-date.component.html',
  styleUrls: ['./accept-date.component.scss']
})
export class AcceptDateComponent extends UserAppComponent implements OnInit {

  title: string = '';
  dateDetails: any;
  maleProfile: any;
  myProfile: any;
  id: any;
  time: any;
  isMale = false;
  currentPage: number;
  declinedForm: FormGroup;
  acceptMessage: string;
  showMessage = false;
  hidden1 = false;
  @ViewChild('firstTime', { static: false }) firstTimeModel: ElementRef;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public firebaseDBService: AngularFireDatabase,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private messageService: MessageModalComponent,
    private sendSmsService: SendSmsService,
    private chatService: ChatService,
    private sendNotificationService: SendNotificationService,
    public paymentService: PaymentService,
    public videoChatService: VideoChatService,
    private confirmService: ConfirmModalComponent,
    private cdr: ChangeDetectorRef
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }
  ngOnInit() {
    this.hidden1 = false;
    if (this.router.url.includes('dates-details/decinedDate')) {
      this.currentPage = 2;
    } else {
      this.currentPage = 1;
    }

    this.myProfile = new User();
    this.maleProfile = new User();
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

    this.fetchUserDetails().then(value => {
      this.loaderService.display(true);
      this.myProfile = value;
      this.isMale = this.myProfile.gender.toUpperCase() == 'MALE';
      this.userDateInfo().then(dateDetails => {
        this.dateDetails = dateDetails;
        this.dateDetails.tmpDate = {
          day: this.dateDetails.date.split(",")[0].trim().toUpperCase(),
          month: this.dateDetails.date.split(",")[1].trim().split(" ")[0].trim().substr(0, 3).toUpperCase(),
          date: this.dateDetails.date.split(",")[1].trim().split(" ")[1].trim(),
        };
        this.dateDetails.preferredDate = this.dateDetails.preferredDate.toUpperCase();
        if (this.dateDetails) {
          this.getProfile();
        }
      });

    });
    this.buildDeclinedForm();
  }

  venueLocation() {
    window.location.href = `https://www.google.com/maps/search/?api=1&query=${this.dateDetails.venueLocation}`;
  }

  maleProfileRedirect() {
    this.router.navigate(['accept-date/' + this.dateDetails.id + '/' + this.maleProfile.id]);
  }

  userDateInfo() {
    return new Promise(resolve => {
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.DATES)
        .child(this.route.snapshot.params.id)
        .once('value', (snapshot) => {
          let dateDetails = snapshot.val();
          resolve(JSON.parse(JSON.stringify(snapshot.val())));

        }).catch((error) => {
          this.loaderService.display(false);
          resolve(JSON.parse(error));
        });
    })
  }

  changePage(step) {
    this.currentPage = step;
  }

  getProfile() {
    this.loaderService.display(true);
    this.time = moment(this.dateDetails.time, 'hh:mm A').add(this.dateDetails.duration, 'hours').format("hh:mm A");
    const userId = this.isMale ? this.dateDetails.femaleUserId : this.dateDetails.maleUserId;
    console.log("userId",userId);
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.USERS)
      .child(userId)
      .once('value', (snapshot) => {
        this.maleProfile = snapshot.val();
        this.title = this.maleProfile.alias.trim();
        let locationArray = this.maleProfile.location.split(",");
        console.log("locationArray",locationArray);
        this.maleProfile.tmplocation = {
          city: locationArray[0] ? locationArray[0].trim() : '',
          state: locationArray[1] ? locationArray[1].trim().split(" ")[0].trim() : '',
          country: locationArray[2] ? locationArray[2].trim().split(" ")[0].trim() : '',
        }
        this.loaderService.display(false);
        if (localStorage.getItem('date_id') !== null && this.myProfile.default_stripe_connect_source != '' && this.myProfile.default_stripe_connect_source != undefined) {
          this.charge();
          localStorage.removeItem('date_id');
        }
      }).catch((error) => {
        this.loaderService.display(false);
      });
  }


  declinedImmediately(isWithReason) {
    if (this.isDatingDateIsPast(new Date(this.dateDetails.timestamp))) {
      this.messageService.open('error', '', 'You cannot decline date invitation from past date.', false, '');
    } else if (this.dateDetails.status == 'Invited') {
      this.refund(isWithReason);
    } else {
      this.refund(isWithReason);
    }
  }

  declinedWithReasons(isWithReason) {
    if (this.declinedForm.valid) {
      this.dateDetails.declineReason = this.declinedForm.value.declinedReason;
      this.dateDetails.declineComment = this.declinedForm.value.comment;
      this.declinedImmediately(isWithReason);
    } else {
      (<any>Object).values(this.declinedForm.controls).forEach(control => {
        control.markAsTouched();
      });

      let message = '';
      if (this.declinedForm.get('declinedReason').hasError('required')) {
        message = 'Please select declined reason.';
      } else if (this.declinedForm.get('comment').hasError('required')) {
        message = 'Please enter comment.';
      } else if (this.declinedForm.touched && this.declinedForm.get('comment').hasError('minlength')) {
        message = 'Comment must be minimum 10 characters long.';
      } else if (this.declinedForm.touched && this.declinedForm.get('comment').hasError('maxLength')) {
        message = 'Comment must be less then 200 characters.';
      }
      this.messageService.open('error', '', message, false, '');
    }
  }

  refund(isWithReason) {
    const that = this;
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.PAYMENT)
      .child(this.dateDetails.maleUserId)
      .child(this.dateDetails.id)
      .once('value', (snapshot) => {
        console.log('snapshot value',snapshot.val());
        that.loaderService.display(true);
        let payment = snapshot.val();
        console.log('from payment',payment);
        let chargeArr = payment.charges;
        let chargeObj = chargeArr[0];
        let charge_id = chargeObj.id;
        let hourString = "";
        hourString = (this.dateDetails.duration > 1) ? (this.dateDetails.duration + 'hrs') : (this.dateDetails.duration + 'hr');
        let charge = {
          "charge_id": charge_id,
          "refund_user_id": this.dateDetails.maleUserId,
          "metadata": {
            "transaction_detail": "No-Show, No-Pay fees refunded for " + this.dateDetails.preferredDate.toLowerCase() + "with " + this.dateDetails.femaleUserAlias + "-" + hourString
          }
        }

        //call refund function on firebase
        var refund = firebase.functions().httpsCallable('refund');
        refund(charge).then(function (result) {
          that.loaderService.display(true);
          const response = result.data;
          console.log(response);
          if (response.message) {
            that.loaderService.display(false);

            that.messageService.open('success', '', response.message, false, '');


          } else {
            that.loaderService.display(false);
            that.fromrefundDecline(isWithReason);
        }
      }).catch(function (error) {
        console.log('from error********', error);
      });
    }).catch((error) => {
      this.loaderService.display(false);
    });
  }
  refundFeesToMaleUser(){
    return new Promise((resolve,reject)=>{
      this.firebaseDBService.database.ref().child(DBREFKEY.PAYMENT)
      .child(this.dateDetails.maleUserId).child(this.dateDetails.id)
      .once('value', async (snapshot) => {
        console.log('snapshot value in refund',snapshot.val());
        let payment = snapshot.val();
        console.log('from payment',payment);
        let chargeArr = payment.charges;
        console.log("chargeArr",chargeArr);
        if(chargeArr.length > 0){
          let chargeObj : any = await this.getCharge(chargeArr);
          console.log("chargeObj",chargeObj);
          if(chargeObj.status === 1){
            let charge_id = chargeObj.data.id;
            let hourString = "";
            hourString = (this.dateDetails.duration > 1) ? (this.dateDetails.duration + 'hrs') : (this.dateDetails.duration + 'hr');
            let requestData = {
              "chargeId": charge_id,
              "userId": this.dateDetails.maleUserId,
              "metadata": {
                "transaction_detail": "Booking Fees refunded for " + this.dateDetails.preferredDate.toLowerCase() + " with " + this.dateDetails.femaleUserAlias + " - " + hourString
              }
            }
            console.log("requestData",requestData);
            let refundData = await this.paymentService.refundCharge(requestData);
            return resolve(true); 
          } else {
            return resolve(true); 
          }
        } else {
          return resolve(true); 
        }
      })
    })
  }
  getCharge(charges){
    return new Promise((resolve,reject)=>{
      let cnt = 0;
      let responseData;
      for (let index = 0; index < charges.length; index++) {
        const element = charges[cnt];
        if(element.payment_type === "Date"){
          responseData = charges[cnt];
        }
        cnt = cnt + 1;
        if(cnt == charges.length){
          if(!responseData) { return resolve({status:3})}
          return resolve({status:1,data:responseData});
        }
      }
    })
  }

  fromrefundDecline(isWithReason) {
    this.dateDetails.status = 'Declined';
    const that = this;
    that.loaderService.display(true);
    this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).set(this.dateDetails).then(async (data: any) => {
      var pushParam = {};
      pushParam["title"] = "User blocked you";
      pushParam["body"] = 'Uh-oh ' + this.myProfile.alias + ' has declined your invite. Try a different date and time?';
      pushParam["metadata"] = { "payload": { "type": "Declined" }, "id": this.dateDetails.id };
      this.sendDateDeclinedSms(this.dateDetails);
      let sendRefud = await this.refundFeesToMaleUser();
      that.loaderService.display(false);
      // sendNotification

      that.currentPage = 3;
    })
  }

  updateDateDeclined() {
    const that = this;
    this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).set(this.dateDetails).then((data: any) => {
      that.loaderService.display(false);
      var pushParam = {};
      pushParam["title"] = "User blocked you";
      pushParam["body"] = 'Uh-oh ' + this.myProfile.alias + ' has declined your invite. Try a different date and time?';
      pushParam["metadata"] = { "payload": { "type": "Declined" }, "id": this.dateDetails.id };

      // sendNotification

      that.currentPage = 3;
    })
  }


  buildDeclinedForm() {
    this.declinedForm = this._formBuilder.group({
      declinedReason: [null, [Validators.required]],
      comment: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(200)]]
    });
  }

  blockUser() {
    this.loaderService.display(true);
    const that = this;
    let blockObj = {};
    const date = moment(new Date(), 'MM-DD-YYYY').format('MM/DD/YY');
    blockObj['id'] = this.maleProfile.id;
    blockObj['name'] = this.maleProfile.alias;
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
    const date = moment(new Date(), 'MM-DD-YYYY').format('MM/DD/YY');
    let Profile = this.maleProfile;

    let updateUser = await this.firebaseDBService.database.ref()
    .child(DBREFKEY.USERS).child(Profile.id).child('whoBlockedYou')
    .child(this.myProfile.id).update({ 'name': this.myProfile.alias, 'date': date });
    
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.USERS)
      .child(this.maleProfile.id)
      .once('value', (snapshot) => {
        this.loaderService.display(false);
      }).catch((error) => {
        this.loaderService.display(false);
      });
    var pushParam = {};
    pushParam["title"] = "User blocked you";
    pushParam["body"] = "Ouch. You’ve been blocked! Things didn’t go too well with " + this.myProfile.alias;
    pushParam["metadata"] = { "payload": { "type": "Blocked" }, "id": this.myProfile.id };

    this.dateDetails.status = 'Cancelled';

    this.dateDetails.femaleUserRemoveAction = true;
    if (this.dateDetails) {
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.DATES)
        .child(this.dateDetails.id)
        .set(this.dateDetails)
        .then((data: any) => {
          this.loaderService.display(false);
          this.router.navigate(['options/blocked-profile']);
        })
    }

    //push notification remaining          
  }

  acceptDate() {
    if(this.myProfile.stripe && this.myProfile.stripe.default_stripe_source != undefined) {
      if (this.isDatingDateIsPast(new Date(this.dateDetails.timestamp))) { // uncomment
        this.messageService.open('error', '', 'You cannot accept date invitation from past date.', false, '');
      } else {
        if (this.dateDetails) {
          if (this.dateDetails.status === 'Invited') {
            console.log('You can charge now')
            this.charge();
          } else if (this.dateDetails.status === 'Declined') {
            this.messageService.open('error', '', 'You already have one accepted date for same day.', false, '');
          } else if (this.dateDetails.status === 'Cancelled') {
            this.messageService.open('error', '', 'Your date partner already cancelled this date.', false, '');
          }
        }
      } // uncomment
    } else {
      this.confirmService.openConfirm('error', 'Please add bank account and debit card to accept a date.', this.redirectPayment, '', this, 'Add', 'Cancel');
      this.cdr.detectChanges();
    }  

  }

  redirectPayment(that) {
    localStorage.setItem("acceptDateId",that.dateDetails.id);
    localStorage.setItem("redirectionFromFemaleAccountPage",'accept-date');
    that.router.navigate(['options/female-account']);
    // let apiUrl = "/handleConnectStripe&client_id=" + environment.STRIPE_KEYS.clientId + "&state=" + that.myProfile.id;
    // let redirectUrl = firebaseUrl + apiUrl;
    // let paymentUrl = "https://connect.stripe.com/express/oauth/authorize?redirect_uri=" + redirectUrl;
    // localStorage.setItem('date_id', that.dateDetails.id);
    // window.open(paymentUrl, "_self");
  }

  charge() {
    this.loaderService.display(true);
    let amount = this.dateDetails.preferredDateRate * this.dateDetails.duration;
    var hourString = "";
    const that = this;
    hourString = (this.dateDetails.duration > 1) ? (this.dateDetails.duration + 'hrs') : (this.dateDetails.duration + 'hr');
    let params = {
      "charge_user_id": this.maleProfile.id,
      "customer": this.maleProfile.stripe ? this.maleProfile.stripe.stripe_customer_id : '',
      "source": this.maleProfile.stripe ? this.maleProfile.stripe.default_stripe_source : '',
      "amount": amount * 100,
      "description": "Date fees charged for" + this.dateDetails.preferredDate.toLowerCase() + "with " + this.myProfile.alias + "-" + hourString,
      "date_id": this.dateDetails.id,
      "metadata": {
        "transaction_detail": "Date fees charged for" + this.dateDetails.preferredDate.toLowerCase() + "with " + this.myProfile.alias + "-" + hourString
      }
    }

    /**
     * function httpsCallable for charge
     *  */
    // var declineDate = firebase.functions().httpsCallable('charge');
    // declineDate(params).then(function (result) {
    //   const response = result.data;

    //   console.log('rom decline date accept', response);
    //   if (response.message) {
    //     that.loaderService.display(false);
    //     that.showMessage = true;
    //     that.acceptMessage = response.message;
    //     document.getElementById("firstTime").click();
    //    // that.messageService.open('success', '', response.message, false, '');
    //   } else {
    that.dateAccepted();
    //  }
    // }).catch(function (error) {
    //   console.log('from error********', error);
    // });
  }

  dateDeclined() {
    this.router.navigate(['dates']);
  }

  dateAccepted() {
    this.dateDetails.status = "Accepted";
    this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).set(this.dateDetails).then((data: any) => {
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.DATES)
        .child(this.route.snapshot.params.id)
        .once('value', (snapshot) => {
          this.dateDetails = snapshot.val();
          this.acceptdeclineDate(this.dateDetails);
        }).catch((error) => {
          this.loaderService.display(false);
        });
    }, (error) => {
      console.log(error);
      this.loaderService.display(false);
    }).catch((error) => {
      console.log(error);
      this.loaderService.display(false);
    });
  }

  // async addCronJobGetMoreDates(date){
  //   let myProfileData = JSON.parse(localStorage.getItem('me'));
  //   let userDetails = {
  //     userId: date.maleUserId,
  //     phoneNumber: myProfileData.phoneNumber,
  //     phoneNumberCode: myProfileData.phoneNumberCode,
  //     receiverId: myProfileData.id,
  //     senderId: date.maleUserId,
  //     dateId: date.id
  //   }
  //   // this.sendSmsService.sendGetMoreRequestCronJob(userDetails);
  // }

  async sendDateAcceptedSms(date){
    let userData : any = await this.getUserDetailsForSms(date.maleUserId);
    let userDetails = {
      senderName: this.myProfile.alias,
      phoneNumber: userData.phoneNumber,
      phoneNumberCode: userData.phoneNumberCode,
      receiverId: userData.userId
    }
    this.sendSmsService.sendDateAcceptedSms(userDetails);
    this.sendNotificationService.sendDateAcceptedNotification(userData.userId,this.myProfile.id,this.myProfile.alias);
  }

  async sendDateDeclinedSms(date){
    let userData : any = await this.getUserDetailsForSms(date.maleUserId);
    let userDetails = {
      senderName: this.myProfile.alias,
      phoneNumber: userData.phoneNumber,
      phoneNumberCode: userData.phoneNumberCode,
      receiverId: userData.userId
    }
    this.sendSmsService.sendDateDeclinedSms(userDetails);
    this.sendNotificationService.sendDateDeclinedNotification(userData.userId,this.myProfile.id,this.myProfile.alias);
  }

  getDateRemainderTime(date){
    let responseDate = new Date(date);
    responseDate.setHours(responseDate.getHours() - 2);
    return responseDate.getTime();
  }

  async sendDateRemainderSms(date){
    let currentTime = Date.now();
    let startTime = date.timestamp;
    let endTime = date.endTimestamp;
    let dateRemainderTime = this.getDateRemainderTime(startTime);
    let userData : any = await this.getUserDetailsForSms(date.maleUserId);
    if(dateRemainderTime > currentTime){
      console.log("allow date remainder");
      let femaleUserDetails = {
        phoneNumber: this.myProfile.phoneNumber,
        phoneNumberCode: this.myProfile.phoneNumberCode,
        type: 'dateRemainderFemale',
        remainderDate: startTime,
        receiverId: this.myProfile.id,
        senderId: userData.userId,
        dateId: date.id
      }
      let maleUserDetails = {
        phoneNumber: userData.phoneNumber,
        phoneNumberCode: userData.phoneNumberCode,
        type: 'dateRemainderMale',
        remainderDate: startTime,
        dateType: date.preferredDate,
        receiverId: userData.userId,
        senderId: this.myProfile.id,
        dateId: date.id
      }
      this.sendSmsService.sendDateRemainderSms(femaleUserDetails);
      this.sendSmsService.sendDateRemainderSms(maleUserDetails);
    }
    if(startTime > currentTime){
      console.log("allow check In remainder");
      let femaleUserDetails = {
        phoneNumber: this.myProfile.phoneNumber,
        phoneNumberCode: this.myProfile.phoneNumberCode,
        type: 'checkInRemainderFemale',
        remainderDate: startTime,
        receiverId: this.myProfile.id,
        senderId: userData.userId,
        dateId: date.id
      }
      let maleUserDetails = {
        phoneNumber: userData.phoneNumber,
        phoneNumberCode: userData.phoneNumberCode,
        type: 'checkInRemainderMale',
        remainderDate: startTime,
        receiverId: userData.userId,
        senderId: this.myProfile.id,
        dateId: date.id
      }
      this.sendSmsService.sendDateRemainderSms(femaleUserDetails);
      this.sendSmsService.sendDateRemainderSms(maleUserDetails);
    }
  }

  getUserDetailsForSms(userId) {
    const self = this;
    return new Promise(function(resolve,reject) { 
      self.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userId)
      .once('value', (snapshot) => {
        let result = snapshot.val();
        let responseData = {
          userId: userId,
          userName: result.fullName,
          phoneNumber: result.phoneNumber,
          phoneNumberCode: result.phoneNumberCode
        }
        return resolve(responseData);
      });
    })
  }

  async acceptdeclineDate(date) {
    let params = {
      "maleUserId": date.maleUserId,
      "femaleUserId": date.femaleUserId,
      "eventDate": date.date,
      "eventId": date.id,
    };
    console.log("params",params);
    const that = this;
    if(that.dateDetails.preferredDate.toLowerCase() != "video chat"){
      console.log("date is declined.......")
      let declineDate = await that.declineDateTrigger(params);
    }
    let pushParam = {};
    pushParam["title"] = "Date Accepted";
    pushParam["body"] = "Great news!" + that.myProfile.alias + "has accepted your date.";
    pushParam["metadata"] = { "payload": { "type": "Accepted", "id": date.id } }
    //that.sendPushNotification(that.maleProfile.id,pushParam);
    //that.addCronJobGetMoreDates(that.dateDetails);
    that.sendDateAcceptedSms(that.dateDetails);
    that.sendDateRemainderSms(that.dateDetails);
    // Video chat
    if(that.dateDetails.preferredDate.toLowerCase() === "video chat"){
      let createRoom = that.createVideoChatRoom(that.dateDetails);
    } else {
      that.loaderService.display(false);
      document.getElementById("firstTime").click();
    }
  }

  declineDateTrigger(params){
    return new Promise((resolve,reject)=> {
      var declineDate = firebase.functions().httpsCallable('declineDate');
      declineDate(params).then(function (result) {
        console.log("result",result);
        return resolve(true);
      }).catch(function (error) {
        console.log("error",error);
        return resolve(true);
      });
    })
  }

  acceptDone(event) {
    if(event.target.id == 'done') {
      console.log("A")
      this.router.navigate(['/dates-details', this.dateDetails.id])
    } else {
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.id).once('value', (snapshot) => {
        console.log("B")
        let matches = snapshot.val().matches;
        let maleUserId = this.maleProfile.id.toString();
        if(matches && maleUserId in matches)
        {
          console.log("C")
          let convoId = matches[maleUserId].convoId;
          this.router.navigate(['/chat/', convoId]);
        } else {
          console.log("D")
          this.chatService.addChat(this.myProfile,this.maleProfile);
        }
        event.stopPropagation();
      });
    }
  }

  sendPushNotification(receiverId, pushParam) {
    let metadata = pushParam["metadata"];
    let payload = metadata["payload"];
    let type = payload["type"];

    this.firebaseDBService.database
      .ref()
      //.child(DBREFKEY.NOTIFICATION)
      .child(receiverId)
      .once('value', (snapshot) => {

      }).catch((error) => {
        this.loaderService.display(false);
      });

  }


  isDatingDateIsPast(date) {

    if (date < (new Date())) {
      return true;
    } else {
      return false;
    }

  }


  uber() {
    if (this.isMobileUser()) {
      window.location.href = "https://m.uber.com/ul";
    }
    else {
      window.location.href = "https://m.uber.com/looking";
    }

  }

  back() {
    this.router.navigate(['dates']);
  }

  createVideoChatRoom(date){
    return new Promise(async (resolve,reject) => {
      const requestData = {
        dateId: date.id,
        femaleUserId: date.femaleUserId,
        maleUserId: date.maleUserId
      }
      console.log("request data",requestData);
      const createRoom = await this.videoChatService.createVideoChatRoom(requestData);
      this.loaderService.display(false);
      document.getElementById("firstTime").click();
    })
  }
}
