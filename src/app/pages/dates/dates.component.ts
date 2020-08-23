import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase, listChanges } from '@angular/fire/database';
import { Router } from '@angular/router';
import { LoaderService, PaymentService, UserService } from 'src/app/services';
import { UserAppComponent } from '@shared/component';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import * as Lodash from 'lodash';
import { CONSTANT } from '@shared/constant';
import { ConfirmModalComponent } from 'src/app/components';

@Component({
  selector: 'app-dates',
  templateUrl: './dates.component.html',
  styleUrls: ['./dates.component.scss']
})
export class DatesComponent extends UserAppComponent implements OnInit {

  title: string = 'MY DATES';
  myProfile: any;
  leftBtn = false;
  userDates: Array<any> = [];
  dates: Array<any> = [];
  dateCounter = 0;
  datesStatus: Array<any> = [];
  filters = {};
  showBlankScreen = false;
  isMale = false;
  cancelData: any;
  checkInButton: Boolean;
  checkInDate: any;
  buttonStatus: string;
  buttonId: string;
  cancelDatePopup = false;
  componentName = 'dates';
  modalOpenStatus: any;
  subscribeObject: any;
  checkUserApprovedStatus = false;

  constructor(
    private router: Router,
    public firebaseService: AngularFireAuth,
    public loaderService: LoaderService,
    public confirmService: ConfirmModalComponent,
    public firebaseDBService: AngularFireDatabase,
    public paymentService: PaymentService,
    public userService: UserService,
    private _ngZone: NgZone) {
    super(loaderService, false, firebaseService, firebaseDBService);
  }

  async ngOnInit() {
    this.loaderService.display(true);
    let checkUser = await this.userService.checkUserApprovedStatus();
    this.loaderService.display(false);
    if(checkUser === true){
      this.checkUserApprovedStatus = true;
      this.cancelDatePopup = false;
      this.fetchUserDetails().then(value => {
        this.myProfile = value;
        this.isMale = this.myProfile.gender.toUpperCase() == 'MALE';
        this.getDateData();
      });
      this.datesStatus = CONSTANT.DATES_STATUS;

      this.subscribeObject = this.loaderService.valueCahnges.subscribe(data => {
        this.modalOpenStatus = data;
      })
    }
  }

  getDateData() {
    this.loaderService.display(true);
    this.dateCounter = 0;
    this.dates = [];
    this.userDates = [];
    const child = this.isMale ? 'maleUserId' : 'femaleUserId';
    this.firebaseDBService.database
      .ref()
      .child(DBREFKEY.DATES)
      .orderByChild(child)
      .equalTo(this.myProfile.id)
      .once('value', async (snapshot) => {
        if (snapshot.val() != null || snapshot.val() != undefined) {
          let tempKeys = (Object.keys(snapshot.val()).map(key => key));
          let tempDateKeys:any = await this.sortDataByDate(snapshot.val(),tempKeys); 
          for (var i = 0; i < tempDateKeys.length; i++) {
            const date: any = snapshot.val()[tempDateKeys[i]];
            if ((!date.maleUserRemoveAction && this.isMale) || (!date.femaleUserRemoveAction && !this.isMale)) {
              date.tmpDate = {
                day: date.date.split(",")[0].trim().toUpperCase(),
                month: date.date.split(",")[1].trim().split(" ")[0].trim().substr(0, 3).toUpperCase(),
                date: date.date.split(",")[1].trim().split(" ")[1].trim(),
              };
              if(date.preferredDate.toLowerCase() === "video chat"){ // video chat
                date.isVideoChat = true;
              }
              this.dates.push(date);
              this.userDates.push(date);
              this.dateCounter = this.dateCounter + 1;
            }
          }
        }
        this.showBlankScreen = true;
        this.loaderService.display(false);
        if (this.dates) {
          //this.pastDates(this.dates); // uncomment
          this.isCheckInEnable(this.dates);
          this.isFinishDateEnable(this.dates);
          this.blockedUser(this.dates);
        }
      }).catch((error) => {
        this.loaderService.display(false);
      });

  }

  sortDataByDate(dates,keys){
    return new Promise((resolve,reject) => {
      let valueArray = [];
      let cnt = 0;
      for(let i = 0; i < keys.length; i++ ){
        let key = keys[cnt];
        let value = {
          key:key,
          value:dates[key].timestamp
        };
        valueArray[cnt] = value;
        cnt = cnt + 1;
        if(cnt === keys.length){
          valueArray.sort(function(a, b){return b['value'] - a['value']});
          let responseArray = valueArray.map(function(val, index){ 
            return val.key; 
          }) 
          return resolve(responseArray)
        }
      }
    })
  }


  // pastDates(dates) {
  //   dates.forEach(async element => {
  //     if ((new Date(element.timestamp) < new Date()) && (element.status === 'Accepted' || element.status === 'Invited')) {
  //       this.loaderService.display(true);
  //       if (element.id !== '') {
  //         this.cancelData = element;
  //         //let sendRefund = await this.refundFeesToMaleUser();
  //         let newStatus = "Cancelled";
  //         if(element.status === 'Accepted'){
  //           newStatus = "Pending";
  //         }
  //         this.firebaseDBService.database
  //           .ref()
  //           .child(DBREFKEY.DATES)
  //           .child(element.id)
  //           .child('status')
  //           .set(newStatus)
  //           .then((data: any) => {
  //             this.loaderService.display(false);
  //             this.getDateData();
  //           })
  //       }
  //     };
  //   })
  // }


  blockedUser(dates) {
    for (let i = 0; i < dates.length; i++) {
      let date = dates[i];
      const userId = this.isMale ? date.femaleUserId : date.maleUserId;
      if (this.myProfile.blockedProfiles) {
        this.myProfile.blockedProfiles.forEach(blockedUser => {
          if (blockedUser.id == userId) {
            this.loaderService.display(true);
            if (date.status == 'Accepted') {
              date.status = 'cancelled';
            }
            if (date.status === 'Invited') {
              date.status = 'Declined';
            }
            this.loaderService.display(false);
            this.firebaseDBService.database
              .ref()
              .child(DBREFKEY.DATES)
              .child(date.id)
              .set(date)
              .then((data) => {
                this.loaderService.display(false);
              }).catch((error) => {
                this.loaderService.display(false);
              })
          }
        });
      }
    }
  }

  isCheckInEnable(dates1) {
    for (let i = 0; i < dates1.length; i++) {
      let date = dates1[i];
      if (date.status === 'Accepted') {
        const datetime = new Date(date.timestamp);
        let lateDate = new Date(datetime);
        lateDate.setHours(new Date(datetime).getHours() + date.duration);
        let earlyDate = new Date(datetime);
        earlyDate.setMinutes(new Date(datetime).getMinutes() - 30);
        if (new Date() >= earlyDate && new Date() <= lateDate) {
          this.checkInButton = true;
          this.buttonStatus = 'CHECK IN';
          this.buttonId = 'checkIn'
          this.checkInDate = date.id;
          break;
        }
      }

    }
  }

  isFinishDateEnable(dates1) {
    for (let i = 0; i < dates1.length; i++) {
      let date = dates1[i];
      if (date.status === 'Ongoing') {
        const expireTime = new Date(date.checkinDateTime);
        expireTime.setHours(expireTime.getHours() + date.duration);
         if (new Date() > expireTime) {
          setTimeout(() => {
            const isDateEndedEarly = false;
            date.status = 'Completed';
            if (this.isMale) {
              date.maleUserDateEndedEarly = isDateEndedEarly;
            } else {
              date.femaleUserDateEndedEarly = isDateEndedEarly;
            }

            this.firebaseDBService.database.ref().child(DBREFKEY.DATES).child(date.id).set(date).then((data: any) => {
              this.loaderService.display(false);
            })
          }, 2000);
        } else {
          this.checkInButton = true;
          this.buttonStatus = 'END DATE';
          this.buttonId = 'endDate';
          this.checkInDate = date.id;
          break;
        }
      }
    }
  }

  checkInDates(event, checkInDate) {
    var value = event.srcElement.attributes.id.nodeValue;
    if (value == 'endDate') {
      this.router.navigate(['ongoing/dates/endDate', checkInDate]);
    } else if (value == 'checkIn') {
      this.router.navigate(['/dates-details', checkInDate]);
    }
  }

  applyFilters() {
    this.dates = Lodash.filter(this.userDates, Lodash.conforms(this.filters));
    this.dateCounter = Math.round(this.dates.length);
  }

  searchBystatus(response: any) {
    if (response.statusValue == "All") {
      this.dates = Object.keys(this.userDates).map(key => this.userDates[key])
      this.dateCounter = Math.round(this.dates.length);
    } else {
      this.filters[response.property] = val => val == response.statusValue;
      this.applyFilters();
    }
  }

  cancelDate(date) {
    this.cancelData = date;
    this.cancelDatePopup = true;
    if(date.status == 'Invited') {
      this.confirmService.openConfirm('error', 'Do you want to cancel this invitation?', this.confirm, this.cancel, this, 'Yes', 'No');
    }else{
      this.confirmService.openConfirm('error', 'Do you want to remove this date?', this.confirm, this.cancel, this, 'Yes', 'No');
    }
  }


  isDatingDateIsPast(date) {
    let dateOffset = (24 * 60 * 60 * 1000) * 1;
    let date1 = new Date(date);
    date1.setTime(date1.getTime() - dateOffset);

    if ((new Date() < date1)) {
      return true;
    } else {
      return false;
    }
  }


  async confirm(that) {
    that.loaderService.display(true);
    if (that.cancelData.status == 'Invited') {
      that.cancelData.status = 'Cancelled';
      let refund = await that.refundFeesToMaleUser();
    } else {
      if (that.isMale) {
        that.cancelData.maleUserRemoveAction = true;
      } else {
        that.cancelData.femaleUserRemoveAction = true;
      }
      that.userDates = that.userDates.filter((date) => {
        return date.id != that.id;
      });
      that.dates = that.dates.filter((date) => {
        return date.id != that.id;
      });
    }
    that.firebaseDBService.database
      .ref()
      .child(DBREFKEY.DATES)
      .child(that.cancelData.id)
      .set(that.cancelData)
      .then(async (data) => {
        that._ngZone.run(() => {
          that.cancelDatePopup = false;
          that.dateCounter = that.dateCounter - 1;
          that.getDateData();
        });
        that.loaderService.display(false);
      }).catch((error) => {
        that.loaderService.display(false);
      })
  }

  cancel(that) {
    that.cancelDatePopup = false;
    that.cancelData = undefined;
  }

  actionOnDate(date) {
    if (date.status == 'Accepted') {
      this.router.navigate(['/dates-details', date.id]);
    } else if (date.status == 'Invited') {
      if (this.isMale) {
        this.cancelDate(date);
      } else {
        this.router.navigate(['/accept-date', date.id]);
      }
    } else if (date.status == 'Ongoing') {
      this.router.navigate(['/ongoing', date.id]);
    } else if(date.status == 'Completed') {
      if(this.isMale && !date.maleUserDateCompletedWithRating){
        this.router.navigate(['/rate-date', date.id]);
      }else if (!this.isMale && !date.femaleUserDateCompletedWithRating){
        this.router.navigate(['/rate-date', date.id]);
      }
    }
  }

  ngOnDestroy() {
    if(this.checkUserApprovedStatus === true){
      this.subscribeObject.unsubscribe();
    }
  }

  notificationCall(event){
    this.router.navigate(['/dates/notifications']);
  }

  refundFeesToMaleUser(){
    return new Promise((resolve,reject)=>{
      this.firebaseDBService.database.ref().child(DBREFKEY.PAYMENT)
      .child(this.cancelData.maleUserId).child(this.cancelData.id)
      .once('value', async (snapshot) => {
        let payment = snapshot.val();
        let chargeArr = payment ? payment.charges : [];
        if(chargeArr.length > 0){
          let chargeObj : any = await this.getCharge(chargeArr);
          if(chargeObj.status === 1){
            let charge_id = chargeObj.data.id;
            var hourString = "";
            hourString = (this.cancelData.duration > 1) ? (this.cancelData.duration + 'hrs') : (this.cancelData.duration + 'hr');
            let requestData = {
              "chargeId": charge_id,
              "userId": this.cancelData.maleUserId,
              "metadata": {
                "transaction_detail": "Booking Fees refunded for " + this.cancelData.preferredDate.toLowerCase() + " with " + this.cancelData.femaleUserAlias + " - " + hourString
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

}
