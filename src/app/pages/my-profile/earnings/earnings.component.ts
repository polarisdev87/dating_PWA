import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService } from 'src/app/services';
import { AngularFireDatabase } from "@angular/fire/database";
import { DBREFKEY } from "@shared/constant/dbRefConstant";
import { CONSTANT } from '@shared/constant';
import { environment } from '../../../../environments/environment';
const FIREBASE_KEYS = environment.FIREBASE_KEYS;
let firebaseUrl = FIREBASE_KEYS.firebaseUrlLive;

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.css']
})
export class EarningsComponent implements OnInit {
  title: string = '';
  rgtBtn;
  listTitle: string = '';

  myProfile;
  availableBal: number = 0;
  pendingBal: number = 0;
  disputeBal: number = 0;
  earningPage: number = 1;
  historyData = [];
  disputeData = [];

  constructor(
    private router: Router,
    public loaderService: LoaderService,
    public paymentService: PaymentService,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public firebaseDBService: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.rgtBtn = "ADD";
    let currentPage = this.route.snapshot.params.detailPage;
    this.myProfile = JSON.parse(localStorage.getItem('me'));
    if (this.myProfile.isApproved === false) {
      location.href = '/finish-profile';
    }
    if(currentPage === 'available'){
      this.setPageDetails(2);
    }
    else if(currentPage === 'pending'){
      this.setPageDetails(3);
    } else if(currentPage === 'dispute'){
      this.setPageDetails(4);
    } else {
      this.setPageDetails(1);
    }
    this.getBalance();
  }

  back(){
    if(this.earningPage === 2 || this.earningPage === 3 || this.earningPage === 4){
      this.router.navigate(['my-profile/earnings']);
    } else {
      this.router.navigate(['feed'])
    }
  }

  async right(){
    localStorage.setItem("redirectionFromFemaleAccountPage",'earning');
    this.router.navigate(['options/female-account']);
    // let apiUrl = "/handleConnectStripe&client_id=" + environment.STRIPE_KEYS.clientId + "&state=" + this.myProfile.id;
    // let redirectUrl = firebaseUrl + apiUrl;
    // let paymentUrl = "https://connect.stripe.com/express/oauth/authorize?redirect_uri=" + redirectUrl; 
    // window.open(paymentUrl,"_self")
  }

  async getBalance(){
    this.loaderService.display(true);
    this.availableBal = 0;
    this.pendingBal = 0;
    let balance: any = await this.paymentService.getBalance(this.myProfile.id);
    let setDisputeEarnings = await this.getPendingDisputeEarnings(false);
    if(balance.result && balance.result.available && balance.result.available.length > 0){
      let availableObj = balance.result.available[0];
      if(availableObj.amount > 0){
        this.availableBal = Number(availableObj.amount/100);
      }
    }
    if(balance.result && balance.result.pending && balance.result.pending.length > 0){
      let pendingObj = balance.result.pending[0];
      if(pendingObj.amount > 0){
        this.pendingBal = Number(pendingObj.amount/100);
      }
    }
    // if(this.earningPage === 1 || this.earningPage === 2 || this.earningPage === 3 ){
    //   let getHistoryData = await this.getTransferHistory();
    // }
    // if(this.earningPage === 4) {
    //   let setDisputeEarnings = await this.getPendingDisputeEarnings(true);
    // }
    this.loaderService.display(false);
  }

  listPage(page){
    if(page === 2){
      if(this.availableBal > 0){
        this.router.navigate(['my-profile/earnings/available']);
      } else {
        let message = "No Earnings Reported. 😢\nTake the leap and go on your first date."
        this.messageService.open('error', '', message, false, '');
      }
    } else if(page === 3){
      if(this.pendingBal > 0){
        this.router.navigate(['my-profile/earnings/pending']);
      } else {
        let message = "No Earnings Reported. 😢\nTake the leap and go on your first date."
        this.messageService.open('error', '', message, false, '');
      }
    } else if(page === 4){
      if(this.disputeBal > 0){
        this.router.navigate(['my-profile/earnings/dispute']);
      } else {
        let message = "No Dispute found. 😢"
        this.messageService.open('error', '', message, false, '');
      }
    }
  }

  async setPageDetails(page){
    this.earningPage = page;
    if(page === 2){ 
      this.title = "AVAILABLE BALANCE";
      this.listTitle = "LIST OF AVAILABLE FUNDS";
    } else if(page === 3){
      this.title = "PENDING BALANCE";
      this.listTitle = "LIST OF PENDING FUNDS";
    } else if(page === 4){
      this.title = "DISPUTE BALANCE";
      this.listTitle = "LIST OF DISPUTE FUNDS";
    }
     else {
      this.title = "EARNINGS";
    }
    if(this.earningPage === 2 || this.earningPage === 3){
      this.loaderService.display(true);
      let getHistoryData = await this.getTransferHistory();
      //this.loaderService.display(false);
    }
    if(this.earningPage === 4){
      this.loaderService.display(true);
      let setDisputeEarnings = await this.getPendingDisputeEarnings(true);
      //this.loaderService.display(false);
    }
  }

  async getTransferHistory(){
    return new Promise(async (resolve, reject) => {
      let availableOn = Math.round(Number(Date.now() / 1000));
      let requestData = {
        userId:this.myProfile.id,
        // availableOn:availableOn
      }
      let history: any = await this.paymentService.getTransferHistory(requestData);
      if(history && history.result && history.result.data && history.result.data.length > 0){
        let setHistoryData = await this.setHistory(history.result.data);
      }
      return resolve(true);
    })
  }

  async setHistory(data){
    return new Promise(async (resolve, reject) => {
      let cnt = 0;
      this.historyData = [];
      let femaleTransfer: any = await this.getFemaleTransfer();
      let checkFemaleTransfer = false;
      let allTransfer = {};
      if(femaleTransfer.status === 1){
        checkFemaleTransfer = true;
        allTransfer = femaleTransfer.data;
      }
      for (let index = 0; index < data.length; index++) {
        const element = data[cnt];
        if(this.earningPage == 2 || this.earningPage == 3){
          let balanceType = "available";
          if(this.earningPage == 3){
            balanceType = "pending";
          }
          if(element.status === balanceType){
            let pushObject = {
              "availableOn":Number(element.available_on * 1000),
              "description":'No Description',
              "amount":Number(element.amount / 100) 
            }
            if(checkFemaleTransfer === true){
              let transferData = allTransfer[element.source];
              if(transferData && transferData.description != '' && transferData.description != undefined){
                pushObject.description = transferData.description;
              }
            }
            this.historyData.push(pushObject);
          }
        }
        // if(element.status === "available"){
        //   this.availableBal += Number(element.amount / 100) 
        // } else if(element.status === "pending"){
        //   this.pendingBal += Number(element.amount / 100) 
        // }
        cnt = cnt + 1;
        if(cnt == data.length){
          return resolve(true);
        }
      }
    })
  }

  async getPendingDisputeEarnings(showDisputeDetails){
    return new Promise(async (resolve, reject) => {
      this.firebaseDBService.database.ref().child(DBREFKEY.DATES)
      .orderByChild("femaleUserId")
      .equalTo(this.myProfile.id)
      .once('value', async (snapshot) => {
        if (snapshot.val() != null || snapshot.val() != undefined) {
          let data = snapshot.val();
          var total= 0;
          let cnt = 0;
          let keys = Object.keys(data);
          if(showDisputeDetails === true){
            this.disputeData = [];
          }
          for (let index = 0; index < keys.length; index++) {
            const element = data[keys[cnt]];
            if(element.status === "Pending"){
              let amount = Number(element.preferredDateRate * element.duration);
              let destination_amount = (amount * 75) / 100;
              total += destination_amount;
              if(showDisputeDetails === true){
                let pushData = {
                  timestamp:element.timestamp,
                  preferredDate:element.preferredDate,
                  status:element.status,
                  amount:destination_amount,
                  duration:element.duration
                }
                this.disputeData.push(pushData);
              }
            }
            cnt = cnt + 1;
            if(cnt === keys.length){
              this.disputeBal = total;
              return resolve(true);
            }
          }
        } else {
          return resolve(true);
        }
      });
    })
  }

  transferBalance(){
    this.router.navigateByUrl("my-profile/earnings/fund-transfer");
  }

  getFemaleTransfer(){
    return new Promise(async (resolve, reject) => {
      this.firebaseDBService.database.ref().child(DBREFKEY.FEMALETRANSFERS)
      .child(this.myProfile.id).once('value', async (snapshot) => {
        if (snapshot.val() != null || snapshot.val() != undefined) {
          let data = snapshot.val();
          if(!data){ return resolve({status:3}); }
          return resolve({status:1,data:data})
        } else {
          return resolve({status:3});
        }
      });
    })
  }
}
