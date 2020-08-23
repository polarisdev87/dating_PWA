import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService, ChatService } from 'src/app/services';
import { AngularFireDatabase } from '@angular/fire/database';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { environment } from '../../../../environments/environment';

import { CONSTANT } from '@shared/constant';
const FIREBASE_KEYS = environment.FIREBASE_KEYS;
const ENV = environment.ENV;
let firebaseUrl = FIREBASE_KEYS.firebaseUrlLive;
let frontUrl = FIREBASE_KEYS.frontUrlLive;
if(ENV === "local"){
    firebaseUrl =  FIREBASE_KEYS.firebaseUrlLive;
    frontUrl = FIREBASE_KEYS.frontUrlLive;
}

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.css']
})
export class PayoutComponent implements OnInit {
  title: string = 'ACCOUNTS';
  rgtBtn;
  paymentUrl;
  accounts;
  myProfile;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public loaderService: LoaderService,
    public paymentService: PaymentService,
    public chatService: ChatService,
    public firebaseDBService: AngularFireDatabase
  ) {
    // if (localStorage.getItem('date_id') !== null) this.router.navigate(['/accept-date', localStorage.getItem('date_id')])
  }

  async ngOnInit() {
    const user = JSON.parse(localStorage.getItem('me'));
    if (user.isApproved === false) {
      location.href = '/finish-profile';
    }
    this.loaderService.display(true);
    this.rgtBtn = "ADD";
    let setProfileData = await this.setUserProfile();
    this.setAccountData();
  }

  back() {
    if(this.router.url.includes('accept-date')){
      let dateId = this.route.snapshot.params['id'];
      this.router.navigate(['accept-date',dateId]);
    } else {
      this.router.navigate(['options']);
    }
  }

  async right(){
    //this.router.navigathandleConnectStripee(['options/payout/add-account']);
    let apiUrl = "/&client_id=" + environment.STRIPE_KEYS.clientId + "&state=" + this.myProfile.id;
    let redirectUrl = firebaseUrl + apiUrl;
    this.paymentUrl = "https://connect.stripe.com/express/oauth/authorize?redirect_uri=" + redirectUrl; 
    window.open(this.paymentUrl,"_self")
  }

  async setAccountData(){
    if(this.myProfile && this.myProfile.stripeConnect && this.myProfile.stripeConnect.length > 0){
      let stripeConnectData = this.myProfile.stripeConnect;
      let cnt = 0;
      let accountData = [];
      for (let index = 0; index < stripeConnectData.length; index++) {
        let connectData = stripeConnectData[cnt].stripeObj;
        if(connectData && connectData.external_accounts){
          let bankAccount = connectData.external_accounts;
          if(bankAccount && bankAccount.data && bankAccount.data.length > 0){
            let getExternalBankDetails: any = await this.getExternalBank(bankAccount.data,accountData,connectData);
            accountData = getExternalBankDetails;
          }
        }
        cnt = cnt + 1;
        if(cnt == stripeConnectData.length){
          this.accounts = accountData;
          this.loaderService.display(false);
          if (localStorage.getItem('date_id') !== null) this.router.navigate(['/accept-date', localStorage.getItem('date_id')])
        }
      }
    } else {
      this.loaderService.display(false);
    }
  }

  getExternalBank(bankAccountList,accountData,connectData){
    return new Promise((resolve,reject)=>{
      let cnt = 0;
      for (let index = 0; index < bankAccountList.length; index++) {
        let bankData = bankAccountList[cnt];
        let isDefaultBank = false;
        let accountId = connectData.id.toString();
        if (typeof this.myProfile.default_stripe_connect_source !== 'undefined') {
          let defaultSource = this.myProfile.default_stripe_connect_source.toString();
          if(defaultSource === accountId){
            isDefaultBank = true;
          }
        }
        let responseData = {
          last4: bankData.last4,
          id: accountId,
          isDefault: isDefaultBank
        };
        accountData.push(responseData);
        cnt = cnt + 1;
        if(cnt == bankAccountList.length){
          return resolve(accountData);
        }
      }
    })
  }

  setUserProfile(){
    return new Promise((resolve,reject)=>{
      const user = JSON.parse(localStorage.getItem('me'));
      this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(user.id).once('value', (snapshot) => {
        this.myProfile = snapshot.val();
        return resolve(true);
      })
    })
  }

  setAsDefault(accountId){
    this.loaderService.display(true);
    this.firebaseDBService.database.ref().child(DBREFKEY.USERS).child(this.myProfile.id)
    .update({'default_stripe_connect_source':accountId})
    .then((data: any) => {
      this.myProfile.default_stripe_connect_source = accountId;
      localStorage.setItem('me',JSON.stringify(this.myProfile));
      this.setAccountData();
    })
  }
}
