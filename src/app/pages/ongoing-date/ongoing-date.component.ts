import { Component, OnInit, NgZone, EventEmitter } from '@angular/core';
import { UserAppComponent } from '@shared/component';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService, SendSmsService, PaymentService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { MessageModalComponent, ConfirmModalComponent } from 'src/app/components';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { CONSTANT } from '@shared/constant/constant';
import * as moment from 'moment';
import '@firebase/functions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-ongoing-date',
  templateUrl: './ongoing-date.component.html',
  styleUrls: ['./ongoing-date.component.scss']
})
export class OngoingDateComponent extends UserAppComponent implements OnInit {


  myProfile: any;
  isMale = false;
  dateDetails: any;
  title: string = '';
  profile: any;
  currentPage: number;
  checkinTime: any;
  dateHour: any;
  endDate: any;
  currentDateTimeString: any;
  dateTitle: string = '';
  dislike = false;
  commentForm: FormGroup;
  finishDate1 = true;
  commentDate = false;
  details1 = true;
  feedBackSend = false;
  likeDateIcone = false;
  dislikeDateIcone = false;
  markAsPending = false;
  OnClickFinish = new EventEmitter<boolean>();
  isVideoChat = false;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public firebaseDBService: AngularFireDatabase,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public confirmService: ConfirmModalComponent,
    private _formBuilder: FormBuilder,
    private ngZone: NgZone,
    private sendSmsService: SendSmsService,
    private paymentService: PaymentService
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }


  ngOnInit() {
    this.fetchUserDetails().then(value => {
      this.loaderService.display(true);
      this.myProfile = value;
      this.isMale = this.myProfile.gender.toUpperCase() == 'MALE';
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.DATES)
        .child(this.route.snapshot.params.id)
        .once('value', (snapshot) => {
          this.loaderService.display(true);
          this.dateDetails = snapshot.val();
          this.dateHour = this.dateDetails.duration;
          this.dateTitle = this.dateDetails.status;
          this.checkinTime = this.dateDetails.checkinDateTime;
          //this.countDown(new Date(this.dateDetails.date), this.dateDetails.time, this.dateDetails.duration, this.dateDetails.endTimestamp);
          this.dateDetails.tmpDate = {
            day: this.dateDetails.date.split(",")[0].trim().toUpperCase(),
            month: this.dateDetails.date.split(",")[1].trim().split(" ")[0].trim().substr(0, 3).toUpperCase(),
            date: this.dateDetails.date.split(",")[1].trim().split(" ")[1].trim(),
          };
          if(this.dateDetails.preferredDate.toLowerCase() === "video chat"){
            this.isVideoChat = true;
          }
          if (this.router.url.includes('dates/endDate')) {
            this.finishDate();
          } else {
            this.currentPage = 1;
            this.finishDate1 = true;
          }
          if (this.dateDetails) {
            this.getProfile();
          }
        }).catch((error) => {
          this.loaderService.display(false);
        });
    });
    this.buildCommentForm();
  }

  buildCommentForm() {
    this.commentForm = this._formBuilder.group({
      comment: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(300)]]
    })
  }


  finishDate() {
    this.markAsPending = false;
    this.OnClickFinish.emit(true);
    this.endDate = new Date(this.dateDetails.checkinDateTime);
    this.endDate.setHours(this.endDate.getHours() + this.dateDetails.duration);
    this.currentDateTimeString = new Date();
    let delta = Math.abs(this.endDate.getTime() - this.currentDateTimeString.getTime()); /// 1000;
    if (this.endDate > this.currentDateTimeString) {
      let minutes = Math.floor(delta / 60000);
      let hours = Math.floor(minutes / 60);
      if(minutes > CONSTANT.CHECKOUT_MINUTES_ALLOWED){
        this.markAsPending = true;
      }
      let hourString = (hours <= 1) ? (hours + 'hr') : (hours + 'hrs');
      let minuteString = (minutes <= 1) ? (minutes + 'min') : (minutes + 'mins');
      this.confirmService.openConfirm('error', `Are you sure you want to finish the date early?\n${hourString + ' ' + minuteString} `, this.confirm, this.cancel, this);
    } else {
      this.setDateToCompleted(this, false);
    }
  }

  async confirm(that) {
    that.setDateToCompleted(that, true);
  }

  setDateToCompleted(that, isDateEndedEarly) {

    if (that.dateDetails.status === 'Ongoing') {
      // let default_stripe_connect_source = (that.currentUser.gender === 'female') ? that.currentUser.default_stripe_connect_source : that.profile.default_stripe_connect_source;

      // let amount = parseInt(that.dateDetails.preferredDateRate) * that.dateDetails.duration;
      // let destination_amount = (amount * 75) / 100;

      // const dateString = moment(new Date(that.dateDetails.date), 'MM-DD-YYYY').format('MM/DD/YY');

      // let hourString = (that.dateDetails.duration > 1) ? (that.dateDetails.duration + 'hrs') : (that.dateDetails.duration + 'hr');

      // let params = {
      //   "transfer_user_id": that.dateDetails.femaleUserId,
      //   "date_id": that.dateDetails.id,
      //  // "source_transaction": ,
      //   "amount": {'id': default_stripe_connect_source},
      //   "description": dateString + that.dateDetails.preferredDate.toLowerCase() + "with " + that.dateDetails.maleUserAlias + "-" + hourString,
      //   "metadata": {
      //       "date": dateString,
      //       "details": that.dateDetails.preferredDate.toLowerCase() + "with " + that.dateDetail.maleUserAlias + "-" + hourString
      //   }
      // }

      // var declineDate = firebase.functions().httpsCallable('transfer');
      // declineDate(params).then(function (result) {
      //   const response = result.data;
      // })

      that.completeDate(isDateEndedEarly);
    }

  }



  timeFinish(event) {
    this.completeDate(event);
  }

  async completeDate(isDateEndedEarly) {
    this.loaderService.display(true);
    this.dateDetails.status = 'Completed';
    if(this.markAsPending === true){ // uncomment
      this.dateDetails.status = 'Pending';
    }
    if (this.isMale) {
      this.dateDetails.maleUserDateEndedEarly = isDateEndedEarly;
    } else {
      this.dateDetails.femaleUserDateEndedEarly = isDateEndedEarly;
    }

    this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).set(this.dateDetails).then(async (data: any) => {
      this.onDateCompleted();
      this.sendDateFinishedSms(this.dateDetails.id);
      if(this.markAsPending != true){ // uncomment
        let sendTransferData = await this.sendTransfer();
      }
      this.loaderService.display(false);
      //this.router.navigate(['dates']);
      //   this.dateTitle = 'Completed';
      //  this.finishDate1 = false;
      //this.commentDate = true;
      this.details1 = true;
    })
  }

  sendTransfer() {
    return new Promise(async (resolve, reject) => {
      let default_stripe_connect_source = (this.currentUser.gender.toLowerCase() === 'female') ? this.currentUser.default_stripe_connect_source : this.profile.default_stripe_connect_source;

      let amount = parseInt(this.dateDetails.preferredDateRate) * this.dateDetails.duration;
      let destination_amount = (amount * 75) / 100;
      const tmpDate = {
        day: this.dateDetails.date.split(",")[0].trim().toUpperCase(),
        month: this.dateDetails.date.split(",")[1].trim().split(" ")[0].trim().substr(0, 3).toUpperCase(),
        date: this.dateDetails.date.split(",")[1].trim().split(" ")[1].trim(),
      };
      let hourString = (this.dateDetails.duration > 1) ? (this.dateDetails.duration + 'hrs') : (this.dateDetails.duration + 'hr');
      let getChargeData: any = await this.getChargeId();
      if (getChargeData.status === 1) {
        let chargeId = getChargeData.data;
        let params = {
          "userId": this.dateDetails.femaleUserId,
          "dateId": this.dateDetails.id,
          "sourceTransaction": chargeId,
          "accountId": default_stripe_connect_source,
          "amount": Number(destination_amount),
          "description": tmpDate.date + ", " +tmpDate.month + " " + this.dateDetails.preferredDate.toLowerCase() + " with " + this.dateDetails.maleUserAlias + " - " + hourString,
          "metadata": {
            "date": this.dateDetails.date,
            "details": this.dateDetails.preferredDate.toLowerCase() + " with " + this.dateDetails.maleUserAlias + " - " + hourString,
            "userId": this.dateDetails.femaleUserId,
            "senderId": this.dateDetails.maleUserId
          }
        }
        let sendTransferToFemaleUser = await this.paymentService.addTransfer(params);
      } else {
        console.log("charge ID is missing");
      }
    })
  }

  onDateCompleted() {
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.DATES)
      .child(this.dateDetails.id)
      .once('value', (snapshot) => {
        this.loaderService.display(false);
        let dateDetails = snapshot.val();
        if (this.isMale) {
          (dateDetails.maleUserDateEndedEarly) ? this.reportProblem() : this.onDateComplet();
        } else {
          (dateDetails.femaleUserDateEndedEarly) ? this.reportProblem() : this.onDateComplet();
        }

      }).catch((error) => {
        this.loaderService.display(false);
      });
  }

  onDateComplet() {
    this.dateTitle = 'Completed';
    this.finishDate1 = false;
    this.commentDate = true;
    this.details1 = true;
    // this.dislike = true;
  }

  async sendDateFinishedSms(dateId) {
    const userId = this.isMale ? this.dateDetails.femaleUserId : this.dateDetails.maleUserId;
    let userData: any = await this.getUserDetailsForSms(userId);
    let userDetails = {
      phoneNumber: userData.phoneNumber,
      phoneNumberCode: userData.phoneNumberCode,
      receiverId: userData.userId,
      senderId: this.myProfile.id,
      dateId: dateId
    }
    let selfUserDetails = {
      phoneNumber: this.myProfile.phoneNumber,
      phoneNumberCode: this.myProfile.phoneNumberCode,
      receiverId: this.myProfile.id,
      senderId: userData.userId,
      dateId: dateId
    }
    this.sendSmsService.sendDateFinishedSms(userDetails);
    this.sendSmsService.sendDateFinishedSms(selfUserDetails);
  }
  getUserDetailsForSms(userId) {
    const self = this;
    return new Promise(function (resolve, reject) {
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

  reportProblem() {
    this.ngZone.run(() => {
      this.details1 = false;
      this.finishDate1 = false;
      this.router.navigate(['report-problem']);
    });
  }


  cancel(data) {

  }

  getProfile() {
    this.loaderService.display(true);
    const userId = this.isMale ? this.dateDetails.femaleUserId : this.dateDetails.maleUserId;
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.USERS)
      .child(userId)
      .once('value', (snapshot) => {
        this.profile = snapshot.val();
        this.title = this.profile.alias.trim();
        let locationArray = this.profile.location.split(",");
        this.profile.tmplocation = {
          city: locationArray[0] ? locationArray[0].trim() : '',
          state: locationArray[1] ? locationArray[1].trim().split(" ")[0].trim() : '',
          country: locationArray[2] ? locationArray[2].trim().split(" ")[0].trim() : '',
        }
        this.loaderService.display(false);
      }).catch((error) => {
        this.loaderService.display(false);
      });
  }

  // countDown(date, time, duration, endTimestamp) {
  //   var index = time.indexOf(":"); // replace with ":" for differently displayed time.
  //   var index2 = time.indexOf(" ");

  //   var hours = parseInt(time.substring(0, index));

  //   var minutes = time.substring(index + 1, index2);

  //   var mer = time.substring(index2 + 1, time.length);
  //   if (mer == "PM") {
  //     hours = hours + 12;
  //   }

  //   date.setHours(hours);
  //   date.setMinutes(minutes);
  //   date.setSeconds("00");
  //   this.dateCreatedDate = date;
  // }


  dislikeDate() {
    this.dislikeDateIcone = true;
    this.dislike = true;
    this.finishDate1 = false;
    this.details1 = false;
  }

  likeDate() {
    this.likeDateIcone = true;
    if (this.details1 == false) {
      this.dislikeDateIcone = false;
      this.details1 = true;
      this.dislike = false;
    }
    const userId = this.isMale ? this.dateDetails.femaleUserId : this.dateDetails.maleUserId;
    if (this.profile.thumbCount === undefined) {
      this.profile.thumbCount = {};
      this.profile.thumbCount['up'] = 1;
    } else if (this.profile.thumbCount['up'] === undefined) {
      this.profile.thumbCount['up'] = 1;
    } else {
      this.profile.thumbCount['up'] = this.profile.thumbCount['up'] + 1;
    }
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userId).child('thumbCount').set(this.profile.thumbCount).then((data: any) => {
      this.loaderService.display(true);
      // this.firebaseDBService.database
      //   .ref()
      //   .child(DBREFKEY.USERS)
      //   .child(userId)
      //   .once('value', (snapshot) => {
      //     this.loaderService.display(false);
      let completeDateWithRating;
      if (this.isMale) {
        completeDateWithRating = 'maleUserDateCompletedWithRating'
      } else {
        completeDateWithRating = 'femaleUserDateCompletedWithRating'
      }
      this.firebaseDBService.database
        .ref()
        .child(DBREFKEY.DATES)
        .child(this.dateDetails.id)
        .child(completeDateWithRating)
        .set(true).then((data: any) => {
          this.loaderService.display(false);
          this.ngZone.run(() => {
            this.router.navigate(['dates']);
          });
        }).catch((error) => {
          this.loaderService.display(false);
        });
      //  })
    }).catch((error) => {
      this.loaderService.display(false);
    });
  }



  submitComment() {
    if (this.commentForm.valid) {
      const userId = this.isMale ? this.dateDetails.femaleUserId : this.dateDetails.maleUserId;
      if (this.profile.thumbCount === undefined) {
        this.profile.thumbCount = {};
        this.profile.thumbCount['down'] = 1;
      } else if (this.profile.thumbCount['down'] === undefined) {
        this.profile.thumbCount['down'] = 1;
      } else {
        this.profile.thumbCount['down'] = this.profile.thumbCount['down'] + 1;
      }

      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(userId).child('thumbCount').set(this.profile.thumbCount).then((data: any) => {
        this.loaderService.display(true);
        this.firebaseDBService.database
          .ref()
          .child(DBREFKEY.USERS)
          .child(userId)
          .once('value', (snapshot) => {
            let completeDateWithRating;
            if (this.isMale) {
              completeDateWithRating = 'maleUserDateCompletedWithRating'
            } else {
              completeDateWithRating = 'femaleUserDateCompletedWithRating'
            }
            this.dateDetails[completeDateWithRating] = true;
            this.dateDetails['femaleUserImproveComment'] = this.commentForm.value.comment;
            this.firebaseDBService.database
              .ref()
              .child(DBREFKEY.DATES)
              .child(this.dateDetails.id)
              .set(this.dateDetails).then((data: any) => {
                this.dislike = false;
                this.finishDate1 = false;
                this.details1 = false;
                this.feedBackSend = true;
                this.loaderService.display(false);
                // this.router.navigate(['dates']);
              }).catch((error) => {
                this.loaderService.display(false);
              });
          })
      }).catch((error) => {
        this.loaderService.display(false);
      });

    } else {
      (<any>Object).values(this.commentForm.controls).forEach(control => {
        control.markAsTouched();
      });

      if (this.commentForm.get('comment').hasError('required')) {
        this.messageService.open('error', '', 'Please provide your comment.', false, '');
      } else if (this.commentForm.get('comment').hasError('minlength')) {
        this.messageService.open('error', '', 'Comment must be minimum 50 characters long.', false, '');
      } else if (this.commentForm.get('comment').hasError('maxLength')) {
        this.messageService.open('error', '', 'Comment must be maximum 300 characters long.', false, '');
      }

    }
  }

  back() {
    this.router.navigate(['dates']);
  }

  getChargeId() {
    return new Promise((resolve, reject) => {
      this.firebaseDBService.database.ref().child(DBREFKEY.PAYMENT)
        .child(this.dateDetails.maleUserId).child(this.dateDetails.id)
        .once('value', async (snapshot) => {
          let payment = snapshot.val();
          if (payment) {
            let chargeArr = payment.charges;
            if (chargeArr.length > 0) {
              let chargeObj: any = await this.getCharge(chargeArr);
              if (chargeObj.status === 1) {
                let charge_id = chargeObj.data.id;
                return resolve({ status: 1, data: charge_id });
              } else {
                return resolve({ status: 3 });
              }
            } else {
              return resolve({ status: 3 });
            }
          } else {
            return resolve({ status: 3 });
          }
        })
    })
  }

  getCharge(charges) {
    return new Promise((resolve, reject) => {
      let cnt = 0;
      let responseData;
      for (let index = 0; index < charges.length; index++) {
        const element = charges[cnt];
        if (element.payment_type === "Date") {
          responseData = charges[cnt];
        }
        cnt = cnt + 1;
        if (cnt == charges.length) {
          if (!responseData) { return resolve({ status: 3 }) }
          return resolve({ status: 1, data: responseData });
        }
      }
    })
  }

  joinVideoDate(){
    let date1 = this.dateDetails.timestamp;
    let lateDate = new Date(date1);
    //lateDate.setHours(new Date(date1).getHours() + this.dateDetails.duration);
    lateDate.setHours(23, 59, 0, 0);

    let earlyDate = new Date(date1);
    earlyDate.setMinutes(new Date(date1).getMinutes() - 30);
    if (new Date() >= earlyDate && new Date() <= lateDate) { //uncomment
      if(this.isVideoChat) {
        this.router.navigate(['/video-chat', this.dateDetails.id]);
      }
    } else { //uncomment
      this.messageService.open('error', '', 'Join video date is only allowed before 30 minutes of date start time till date end time.', false, '');
    }

  }

  copyToClipart(value) {
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    this.messageService.open(
      "success",
      "",
      `Meeting ID Number is copied to clipboard.`,
      false,
      ""
    );
  }
}
