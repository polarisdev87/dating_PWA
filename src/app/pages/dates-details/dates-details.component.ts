import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { UserAppComponent } from '@shared/component';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderService, SendSmsService, ChatService, SendNotificationService, PaymentService, GoogleService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import * as moment from 'moment';
// import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { MessageModalComponent, ConfirmModalComponent } from 'src/app/components';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dates-details',
  templateUrl: './dates-details.component.html',
  styleUrls: ['./dates-details.component.scss']
})
export class DatesDetailsComponent extends UserAppComponent implements OnInit {

  title: string = '';
  rgtIcon: string = 'favorite_inactive.png';
  dateStatus;
  enableChatButton: boolean = false;
  dateDetails: any;
  profile: any;
  myProfile: any;
  id: any;
  time: any;
  isMale = false;
  qrdata: string = '123456';
  isRead: boolean = false;
  availableDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo;
  // qrResultString: string = '';
  // hasCameras = false;
  hasPermission: boolean;
  acceptDate: boolean;
  currentDevice: MediaDeviceInfo;
  // scannerEnabled: any;
  cancelDateFlag = false;
  cancelForm: FormGroup;
  otpForm: FormGroup;
  isWithReason: boolean;
  qrCheckIn = true;
  otpCheckInButton = true;
  otpCheckInSelected = false;
  qrCode: any;
  // openOTPForm = false;
  // buttonLabel = 'Show OTP';

  dateSubscribe: any;
  dateRef: any;
  isVideoChat = false;

  // @ViewChild('scanner', { static: false }) scanner: ZXingScannerComponent;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public firebaseDBService: AngularFireDatabase,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    private ngZone: NgZone,
    public confirmService: ConfirmModalComponent,
    private _formBuilder: FormBuilder,
    private sendSmsService: SendSmsService,
    private chatService: ChatService,
    private sendNotificationService: SendNotificationService,
    private paymentService: PaymentService,
    public googleService: GoogleService,
  ) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }
  ngOnInit() {
    // this.scannerEnabled = false;
    this.cancelDateFlag = false;
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.loaderService.display(true);
    // this.setupScanner();
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
          this.dateStatus = this.dateDetails.status;
          this.qrdata = (this.isMale) ? this.dateDetails.id.substring(0, 4) : this.dateDetails.id.substr(this.dateDetails.id.length - 4);
          this.dateDetails.tmpDate = {
            day: this.dateDetails.date.split(",")[0].trim().toUpperCase(),
            month: this.dateDetails.date.split(",")[1].trim().split(" ")[0].trim().substr(0, 3).toUpperCase(),
            date: this.dateDetails.date.split(",")[1].trim().split(" ")[1].trim(),
          };
          if(this.dateDetails.preferredDate.toLowerCase() === "video chat"){ //video chat
            if(this.dateDetails.status.toLowerCase() === 'ongoing'){
              this.router.navigate(['ongoing', this.dateDetails.id]);
            }
            this.isVideoChat = true;
          }
          if (this.router.url.includes('dates/scanQr')) {
            this.isRead = true;
            this.checkIn();
          } else {
            this.acceptDate = true;
            this.isRead = false;
          }
          if (this.dateDetails) {
            this.getProfile();
          }
        }).catch((error) => {
          this.loaderService.display(false);
        });
    });

    if (!this.isMale) {
      this.dateRef = this.firebaseDBService.list(`dates/${this.route.snapshot.params.id}`);
      setTimeout(() => {
        this.dateSubscribe = this.dateRef.snapshotChanges().subscribe(actions => {
          actions.forEach(action => {
            if (!this.isVideoChat && action.type == "child_changed" && action.key == "status" && action.payload.val() == "Ongoing") {
              this.dateSubscribe.unsubscribe();
              this.messageService.open('success', '', 'You are Checked In!', false, '');
              this.onTapDone();
            }
          });

        })
      }, 1000);
    }

    this.buildCancelDateForm();
    this.buildOtpForm();
  }

  getProfile() {
    this.loaderService.display(true);
    this.time = moment(this.dateDetails.time, 'hh:mm A').add(this.dateDetails.duration, 'hours').format("hh:mm A");
    const userId = this.isMale ? this.dateDetails.femaleUserId : this.dateDetails.maleUserId;
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.USERS)
      .child(userId)
      .once('value', (snapshot) => {
        this.profile = snapshot.val();
        if(this.profile){
          this.title = this.profile.alias.trim();
          this.enableChatButton = true;
          if (this.myProfile.favorites && (this.myProfile.favorites.includes(userId))) {
            this.profile.isFavorite = true;
            this.rgtIcon = 'favorite_active.png';
          } else {
            this.profile.isFavorite = false;
            this.rgtIcon = 'favorite_inactive.png';
          }
          this.loaderService.display(false);
        } else {
          this.dateDetails.status = 'Cancelled';
          this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).set(this.dateDetails).then((data: any) => {
            this.loaderService.display(false);
            this.messageService.open('error', '', 'Date has been cancelled as user has been deleted by Administration!', false, '');
            this.router.navigate(['dates']);
          });
        }
      }).catch((error) => {
        this.loaderService.display(false);
      });
  }

  makeUserFav() {
    if (this.profile.isFavorite) {
      this.confirmService.openConfirm('error', 'Are you sure you want to remove "' + this.profile.alias.trim() + '" from your favorites?', this.confirmFav, this.cancel, this);
    } else {
      this.addToFavoriate(this.profile);
      this.profile.isFavorite = true;
      this.rgtIcon = 'favorite_active.png';
    }
  }

  confirmFav(that) {
    that.removeFromFavoriate(that.profile);
  }

  async addToFavoriate(user) {
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
    this.sendNotificationService.sendFavoriateYouNotification(user.id,this.myProfile);
    this.sendSmsService.sendFavoriateYouSms(user, this.myProfile);
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).set(this.myProfile).then((data: any) => {
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
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.uid).set(this.myProfile).then((data: any) => {
      this.updateUserDetails().then(response => {
        this.profile.isFavorite = false;
        this.rgtIcon = 'favorite_inactive.png';
        this.loaderService.display(false);
      })
    }, (error) => {
      this.loaderService.display(false);
    }).catch((error) => {
      this.loaderService.display(false);
    });
  }

  buildCancelDateForm() {
    this.cancelForm = this._formBuilder.group({
      comment: [null, [Validators.required, Validators.minLength(50), Validators.maxLength(200)]]
    });
  }

  buildOtpForm() {
    this.otpForm = this._formBuilder.group({
      otp: ['', [Validators.required]]
    });
  }

  // setupScanner() {
  //   if (this.scanner) {
  //     this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
  //       this.hasCameras = true;
  //       if (devices) {
  //         this.availableDevices = devices;
  //         this.currentDevice = devices[0];
  //         for (const device of devices) {
  //           if (device.kind.toString() === 'videoinput') {
  //             this.videoDevices.push(device);
  //           }
  //         }
  //         if (this.videoDevices.length > 0) {
  //           let choosenDev;
  //           for (const dev of this.videoDevices) {
  //             if (/back|rear|environment/gi.test(dev.label)) {
  //               choosenDev = dev;
  //               this.currentDevice = dev;
  //               break;
  //             }
  //           }
  //           this.scannerEnabled = true;
  //         }
  //       }
  //     }, error => {
  //       this.openOTPForm = true;
  //     });

  //     this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
  //       this.openOTPForm = true;
  //     }, error => {
  //       this.openOTPForm = true;
  //     });

  //     this.scanner.permissionResponse.subscribe((answer: boolean) => {
  //       this.openOTPForm = true;
  //       this.hasPermission = answer;
  //     }, error => {
  //       this.openOTPForm = true;
  //     });
  //   } else {
  //     this.openOTPForm = true;
  //   }
  // }

  isDatingDateIsPast(date1) {
    let lateDate = new Date(date1);
    //lateDate.setHours(new Date(date1).getHours() + this.dateDetails.duration);
    lateDate.setHours(23, 59, 0, 0);

    let earlyDate = new Date(date1);
    earlyDate.setMinutes(new Date(date1).getMinutes() - 30);

    if (new Date() >= earlyDate && new Date() <= lateDate) { //uncomment
      if(!this.isVideoChat){
        this.confirmService.openConfirm('error', 'Are you at the location of your date?', this.cancel,  this.confirmLocation, this , 'No', 'Yes');
      } else {
        this.router.navigate(['/video-chat', this.dateDetails.id]);
      }
    } else { //uncomment
      this.messageService.open('error', '', 'Check In is only allowed before 30 minutes of date start time till date end time.', false, '');
    }
  }

  // handleQrCodeResult(resultString: string) {
  //   this.isRead = false;
  //   this.qrResultString = resultString;
  //   this.declineDate(this.qrResultString);
  // }

  submitOTP() {
    if (this.otpForm.valid) {
      this.declineDate(this.otpForm.value.otp);
    } else {
      (<any>Object).values(this.otpForm.controls).forEach(control => {
        control.markAsTouched();
      });
      if (this.otpForm.get('otp').hasError('required')) {
        this.messageService.open('error', '', 'Please Enter OTP', false, '');
      }
    }
  }

  // ScanCode() {
  //   this.scannerEnabled = true;
  // }

  showQRCode() {
    this.qrCheckIn = true;
    this.otpCheckInSelected = true;
    this.otpCheckInSelected = false;
  }

  otpCheckIn() {
    var id = this.dateDetails.id;
    this.qrCode = (this.isMale) ? this.dateDetails.id.substring(0, 4) : this.dateDetails.id.substr(id.length - 4);
    this.qrCheckIn = false;
    this.otpCheckInSelected = true;
    this.otpCheckInButton = false;
    // this.buttonLabel = 'Show QRCode';
  }

  declineDate(qrResultString) {
    let userDateId = (this.isMale) ? this.dateDetails.id.substr(this.dateDetails.id.length - 4) : this.dateDetails.id.substring(0, 4);
    if (qrResultString === userDateId) { // uncomment
      this.isRead = false;
      this.dateDetails.status = 'Ongoing';
      this.dateDetails['checkinDateTime'] = new Date().toString();
      let dateTime = new Date();
      dateTime.setHours(dateTime.getHours() + this.dateDetails.duration);
      this.dateDetails.endTimestamp = dateTime.getTime();
      this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(this.dateDetails.id).set(this.dateDetails).then((data: any) => {        
        // this.scannerEnabled = false;
        this.messageService.open('success', '', 'You are Checked In!', false, '');
        this.sendDateStartedSms(this.dateDetails);
        this.onTapDone();
      }, (error) => {
        this.loaderService.display(false);
      }).catch((error) => {
        this.loaderService.display(false);
      });
    } else { // uncomment
      this.isRead = true;
      // this.scannerEnabled = false;
      this.messageService.open('error', '', 'Invalid Code. Please Enter valid Code from your date partner phone.', false, '');
    }
  }

  async sendDateStartedSms(dateDetails){
    let currentTime = Date.now();
    const endTime = dateDetails.endTimestamp;
    const userId = this.isMale ? this.dateDetails.femaleUserId : this.dateDetails.maleUserId;
    let userData : any = await this.getUserDetailsForSms(userId);
    let userDetails = {
      phoneNumber: userData.phoneNumber,
      phoneNumberCode: userData.phoneNumberCode,
      receiverId: userData.userId
    }
    this.sendSmsService.sendDateStartedSms(userDetails);
    this.sendNotificationService.sendDateStartedNotification(userData.userId,this.myProfile.id);

    if(endTime > currentTime){
      let femaleUserDetails = {
        phoneNumber: this.myProfile.phoneNumber,
        phoneNumberCode: this.myProfile.phoneNumberCode,
        type: 'checkOutRemainder',
        remainderDate: endTime,
        receiverId: this.myProfile.id,
        senderId: userData.userId,
        dateId: dateDetails.id
      }
      let maleUserDetails = {
        phoneNumber: userData.phoneNumber,
        phoneNumberCode: userData.phoneNumberCode,
        type: 'checkOutRemainder',
        remainderDate: endTime,
        receiverId: userData.userId,
        senderId: this.myProfile.id,
        dateId: dateDetails.id
      }
      this.sendSmsService.sendDateRemainderSms(femaleUserDetails);
      this.sendSmsService.sendDateRemainderSms(maleUserDetails);
    }
  }

  onTapDone() {
    this.ngZone.run(() => {
      this.router.navigate(['ongoing', this.dateDetails.id]);
    });
  }


  cancelDate1() {
    this.cancelDateFlag = true;
    this.acceptDate = false;
  }

  cancel(data) {

  }

  onTapCancel(isWithReason) {
    this.onCancel(isWithReason);
  }

  onTapCancelWithReason(isWithReason) {
    if (this.cancelForm.valid) {
      this.onCancel(isWithReason);
    } else {
      (<any>Object).values(this.cancelForm.controls).forEach(control => {
        control.markAsTouched();
      });

      let message = '';
      if (this.cancelForm.get('comment').hasError('required')) {
        message = 'Please enter comment.';
      } else if (this.cancelForm.touched && this.cancelForm.get('comment').hasError('minlength')) {
        message = 'Cancel comment must be minimum 50 characters long.';
      } else if (this.cancelForm.touched && this.cancelForm.get('comment').hasError('maxLength')) {
        message = 'Cancel comment must be maximum 300 characters long.';
      }
      this.messageService.open('error', '', message, false, '');
    }
  }

  onCancel(isWithReason) {
    let dateOffset = (24 * 60 * 60 * 1000) * 1;
    let earlyDate = new Date(this.dateDetails.timestamp);
    earlyDate.setTime(earlyDate.getTime() - dateOffset);
    if ((new Date() < earlyDate)) {
      if (this.dateDetails.status === 'Accepted') {
        this.refund(isWithReason);
      } else if (this.dateDetails.status === 'Ongoing') {
        this.messageService.open('error', '', 'Date cannot be cancelled as5:00 PM your date partner already checked in for this date.', false, '');
      } else if (this.dateDetails.status === 'Cancelled') {
        this.messageService.open('error', '', 'Your date partner already cancelled this date.', false, '');
      }

    } else {
      this.messageService.open('error', '', 'Date only be cancelled before 24 hours of date start time.', false, '');
    }
  }

  refund(isWithReason) {
    this.cancelDate(isWithReason)
  }

  cancelDate(isWithReason) {
    this.isWithReason = isWithReason;
    this.confirmService.openConfirm('error', 'Are you sure you want to cancel this date?', this.confirm, this.cancel, this);
  }

  confirm(that) {
    that.loaderService.display(true);
    that.dateDetails.status = 'Cancelled';
    if (that.isWithReason) {
      that.dateDetails['cancelComment'] = that.cancelForm.value.comment;
    }
    that.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(that.dateDetails.id).set(that.dateDetails).then(async (data: any) => {
      let pushParam = {};
      pushParam["title"] = "Date Cancelled";
      pushParam["body"] = 'Oh, bummer! ' + that.myProfile.alias + ' cancelled the date.\nThat time is now free on your calendar. 🗓️Meet someone new?';
      pushParam["metadata"] = { "payload": { "type": "Declined" }, "id": that.dateDetails.id };
      that.sendDateCancelledCronJob();
      let sendRefund = await that.refundFeesToMaleUser();
      that.loaderService.display(false);
      that.ngZone.run(() => {
        that.router.navigate(['dates']);
      });
    })
  }

  async sendDateCancelledCronJob(){
    let userId = this.isMale ? this.dateDetails.femaleUserId : this.dateDetails.maleUserId
    let userData : any = await this.getUserDetailsForSms(userId);
    let userDetails = {
      senderName: this.myProfile.alias,
      phoneNumber: userData.phoneNumber,
      phoneNumberCode: userData.phoneNumberCode,
      gender: this.isMale ? 'male' : 'female',
      receiverId:userData.userId 
    }
    this.sendSmsService.sendDateCancelledCronJob(userDetails);
    this.sendNotificationService.sendDateCancelledNotification(userData.userId,this.myProfile.id,this.myProfile.alias,userDetails.gender);
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

  checkIn() {
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.DATES)
      .child(this.dateDetails.id)
      .once('value', (snapshot) => {
        let dataData = snapshot.val();
        this.ngZone.run(() => {
          if (dataData.status === 'Accepted') {
            this.isDatingDateIsPast(new Date(snapshot.val().timestamp))
          }
          else if (snapshot.val().status === 'Ongoing') {
            this.messageService.open('error', '', 'Your date partner already checked in for this date.', false, '');
          }
          else if (dataData.status === 'Cancelled') {
            this.messageService.open('error', '', 'Your date partner already cancelled this date.', false, '');
          }
        });
      }).catch((error) => {
        this.loaderService.display(false);
      });
  }

  async confirmLocation(that){
    that.loaderService.display(true);
    let updateCheckInLocation = await that.updateDateCheckInLocation(that);
    that.loaderService.display(false);
    that.scannerEnabled = true;
    that.isRead = true;
    that.acceptDate = false;
  }

  updateDateCheckInLocation(that){
    return new Promise(async (resolve, reject) => {
      let getLocation = await that.googleService.getCheckInUserLocation();
      let updateLocation = await that.firebaseDBService.database.ref().child(DBREFKEY.DATES)
      .child(that.dateDetails.id).update(getLocation);
      return resolve(true);
    })
  }

  blockUser() {
    this.loaderService.display(true);
    const that = this;
    let blockObj = {};
    const date = moment(new Date(), 'MM-DD-YYYY').format('MM/DD/YY');
    blockObj['id'] = this.profile.id;
    blockObj['name'] = this.profile.alias;
    blockObj['date'] = date;
    this.myProfile.blockedProfiles.push(blockObj);

    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.id).set(this.myProfile).then((data: any) => {
      this.updateUserDetails().then(response => {
        this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.profile.id).child('whoBlockedYou').child(this.myProfile.id).update({
          'name': this.myProfile.alias,
          'date': date
        }).then((data: any) => {
          var pushParam = {};
          pushParam["title"] = "User blocked you";
          pushParam["body"] = "Ouch. You’ve been blocked! Things didn’t go too well with " + this.myProfile.alias;
          pushParam["metadata"] = { "payload": { "type": "Blocked" }, "id": this.myProfile.id };

          this.dateDetails.status = 'Cancelled';
          if (this.isMale) {
            this.dateDetails.maleUserRemoveAction = true;
          } else {
            this.dateDetails.femaleUserRemoveAction = true;
          }
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
        })
      })
    }, (error) => {
      this.loaderService.display(false);
    }).catch((error) => {
      this.loaderService.display(false);
    });
  }


  report() {
    this.router.navigate(['dates-details/' + this.dateDetails.id + '/report-problem']);
  }

  uber() {
    if (this.isMobileUser()) {
      window.location.href = "https://m.uber.com/ul";
    }
    else {
      window.location.href = "https://m.uber.com/looking";
    }
  }

  venueLocation() {
    window.location.href = `https://www.google.com/maps/search/?api=1&query=${this.dateDetails.venueLocation}`;
  }

  back() {
    if (this.acceptDate) {
      this.router.navigate(['dates']);
    }
    else {
      this.isRead = false;
      this.acceptDate = true;
    }
  }

  async startChat(){
    let getMatches: any = await this.getMatchesByUser();
    let matches = getMatches.data.matches;
    let favUserId = this.myProfile.uid.toString();
    if(matches && favUserId in matches)
    {
      let convoId = matches[favUserId].convoId;
      this.router.navigate(['/chat/', convoId]);
    }
    else {
      this.chatService.addChat(this.myProfile,getMatches.data);
    }
  }

  getMatchesByUser(){
    return new Promise((resolve,reject) => {
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.profile.id).once('value', (snapshot) => {
        let data = snapshot.val();
        return resolve({status:1,data:data});
      })
    })
  }

  redirectToFeed(userId){
    this.router.navigate(['/dates-details/feed-detail',userId,this.route.snapshot.params.id]);
  }

  refundFeesToMaleUser(){
    return new Promise((resolve,reject)=>{
      this.firebaseDBService.database.ref().child(DBREFKEY.PAYMENT)
      .child(this.dateDetails.maleUserId).child(this.dateDetails.id)
      .once('value', async (snapshot) => {
        let payment = snapshot.val();
        let chargeArr = payment.charges;
        if(chargeArr.length > 0){
          let chargeObj : any = await this.getCharge(chargeArr);
          if(chargeObj.status === 1){
            let charge_id = chargeObj.data.id;
            var hourString = "";
            hourString = (this.dateDetails.duration > 1) ? (this.dateDetails.duration + 'hrs') : (this.dateDetails.duration + 'hr');
            let requestData = {
              "chargeId": charge_id,
              "userId": this.dateDetails.maleUserId,
              "metadata": {
                "transaction_detail": "Booking Fees refunded for " + this.dateDetails.preferredDate.toLowerCase() + " with " + this.dateDetails.femaleUserAlias + " - " + hourString
              }
            }
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
