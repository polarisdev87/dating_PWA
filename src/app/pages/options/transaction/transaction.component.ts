import { Component, OnInit } from '@angular/core';
import { UserAppComponent } from '@shared/component';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/services';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent extends UserAppComponent implements OnInit {

  title: string = 'TRANSACTIONS';
  transactions;
  myProfile;
  constructor(
    public loaderService: LoaderService,
    public firebaseService: AngularFireAuth,
    public firebaseDBService: AngularFireDatabase,
    private router: Router) {
    super(loaderService, false, firebaseService, firebaseDBService); 
  }

  async ngOnInit() {
    const user = JSON.parse(localStorage.getItem('me'));
    if (user.isApproved === false) {
      location.href = '/finish-profile';
    }
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    let fetchUserData: any = await this.fetchMyProfileDetails();
    if(fetchUserData.status === 1){
      this.myProfile = fetchUserData.data;
      let gender = this.myProfile.gender;
      if(gender.toUpperCase() === "MALE"){
        this.initMaleTransactions();
      } else {
        this.initFemaleTransactions();
      }
    }
  }

  fetchMyProfileDetails(){
    return new Promise((resolve, reject) => {
      this.fetchUserDetails().then(value => {
        if(value === '' || value === undefined){
          return resolve({status:3})
        } else {
          return resolve({status:1,data:value});
        }
      }).catch(error=>{
        return resolve({status:3})
      })
    })
  }

  back() {
    this.router.navigate(['options']);
  }

  async initMaleTransactions(){
    this.loaderService.display(true);
    let getChargesData: any = await this.getCharges();
    if(getChargesData.status === 1){
      let charges = getChargesData.data;
      let setChargesData: any = await this.setCharges(charges);
      this.transactions = setChargesData;
      this.loaderService.display(false);
    } else {
      this.loaderService.display(false);
    }
  }

  async initFemaleTransactions(){
    this.loaderService.display(true);
    let getPayoutData: any = await this.getCharges();
    if(getPayoutData.status === 1){
      let payouts = getPayoutData.data.payouts;
      if(payouts && payouts.length > 0){
        payouts.sort(this.compareValues('timestamp','desc'));
        this.transactions = payouts;
      }
      this.loaderService.display(false);
    } else {
      this.loaderService.display(false);
    }
  }

  getCharges(){
    return new Promise((resolve,reject)=>{
      this.firebaseDBService.database.ref().child(DBREFKEY.PAYMENT)
      .child(this.myProfile.id).once('value', (snapshot) => {
        let charges = snapshot.val();
        if(!charges){ return resolve({status:3}); }
        return resolve({status:1,data:charges});
      }).catch((error) => { return resolve({status:3}); })
    })
  }

  setCharges(charges){
    return new Promise(async (resolve,reject)=>{
      let cnt = 0;
      let responseArray = [];
      let chargeKeys = Object.keys(charges);
      for (let i = 0; i < chargeKeys.length; i++) {

        if(chargeKeys[i]==='refund'){
          let refund = charges[chargeKeys[cnt]];
          if(refund && refund.length > 0){
            let getArrayData : any = await this.getRefundDataFromArray(refund,responseArray)
            responseArray = getArrayData;
          }
        }else{
          let charge = charges[chargeKeys[cnt]].charges;
          if(charge && charge.length > 0){
            let getArrayData : any = await this.getChargesDataFromArray(charge,responseArray)
            responseArray = getArrayData;
          }
        }
        cnt = cnt + 1;
        if(cnt == chargeKeys.length){
          responseArray.sort(this.compareValues('timestamp','desc'));
          return resolve(responseArray);
        }
      }
    })
  }

  getChargesDataFromArray(chargeArray,responseArray){
    return new Promise((resolve,reject)=>{
      let cnt = 0;
      for (let i = 0; i < chargeArray.length; i++) {
        let data = chargeArray[cnt];
        let amount = Number(data.amount / 100);
        let date = data.created * 1000;
        let responseData = {
          amount:amount,
          timestamp:date,
          description:data.description
        }
        responseArray.push(responseData);
        cnt = cnt + 1;
        if(cnt == chargeArray.length){
          return resolve(responseArray);
        }
      }
    })
  }

  getRefundDataFromArray(chargeArray,responseArray){
    return new Promise((resolve,reject)=>{
      let cnt = 0;
      for (let i = 0; i < chargeArray.length; i++) {
        let data = chargeArray[cnt];
        let amount = Number(data.amount / 100);
        let date = data.created * 1000;
        let responseData = {
          amount:amount,
          timestamp:date,
          description:data.metadata.transaction_detail
        }
        responseArray.push(responseData);
        cnt = cnt + 1;
        if(cnt == chargeArray.length){
          return resolve(responseArray);
        }
      }
    })
  }

  compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }
  
      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }
}
