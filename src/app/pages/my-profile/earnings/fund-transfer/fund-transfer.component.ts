import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService } from 'src/app/services';
import { AngularFireDatabase } from "@angular/fire/database";
import { DBREFKEY } from "@shared/constant/dbRefConstant";
import { FormGroup, FormBuilder, Validators, FormControl, ValidationErrors, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-fund-transfer',
  templateUrl: './fund-transfer.component.html',
  styleUrls: ['./fund-transfer.component.css']
})
export class FundTransferComponent implements OnInit {
  title: string = 'FUND TRANSFER';
  myProfile;
  availableBal: number = 0;
  fundTransferForm: FormGroup;
  accounts;
  sourceType: String = 'bank_account';

  constructor(
    private router: Router,
    public loaderService: LoaderService,
    public paymentService: PaymentService,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public firebaseDBService: AngularFireDatabase,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.myProfile = JSON.parse(localStorage.getItem('me'));
    this.buildForm();
    this.getBalance();
  }

  back() {
    this.router.navigate(['my-profile/earnings'])
  }

  async getBalance() {
    this.loaderService.display(true);
    let balance: any = await this.paymentService.getBalance(this.myProfile.id);
    if (balance.result && balance.result.available && balance.result.available.length > 0) {
      let availableObj = balance.result.available[0];
      if (availableObj.amount > 0) {
        this.availableBal = Number(availableObj.amount / 100);
      }
      let amountSourceType = Object.keys(availableObj.source_types);
      if(amountSourceType.length > 0){
        this.sourceType = amountSourceType[0];
      }
    }
    //let getHistoryData = await this.getTransferHistory();
    let getAccountIds: any = await this.getAccountIds();
    if(getAccountIds.status == 3){
      this.messageService.open('error','','Account required for transfer funds.',true,'');
      this.router.navigateByUrl('options/payout');
    } else {
      this.accounts = getAccountIds.data;
      this.fundTransferForm.controls['account'].setValue(this.accounts[0]);
      this.fundTransferForm.controls['amount'].setValue(this.availableBal);
    }
    this.loaderService.display(false);
  }

  buildForm() {
    this.fundTransferForm = this._formBuilder.group({
      account: ['', [Validators.required]],
      amount: ['', [Validators.required]]
    });
  }

  getAccountIds(){
    return new Promise((resolve, reject) => {
      if(this.myProfile && this.myProfile.stripeConnect && this.myProfile.stripeConnect.length > 0){
        let accounts = this.myProfile.stripeConnect;
        let responseData = [];
        let defaultData = [];
        let cnt = 0;
        let singleAccount = accounts[0];
        if(singleAccount && singleAccount.stripeObj && singleAccount.stripeObj.external_accounts){
          let externalAccounts = singleAccount.stripeObj.external_accounts;
          if(externalAccounts.data && externalAccounts.data.length > 0){
            let cardDetails = externalAccounts.data;
            for (let index = 0; index < cardDetails.length; index++) {
              if(cardDetails[cnt] && cardDetails[cnt].last4 != '' && cardDetails[cnt].last4 != undefined){
                if(cardDetails[cnt].default_for_currency === true){
                  defaultData.push({
                    "account":cardDetails[cnt].account,
                    "last4":cardDetails[cnt].last4,
                    "id":cardDetails[cnt].id,
                    "isDefault": true
                  });
                } else {
                  responseData.push({
                    "account":cardDetails[cnt].account,
                    "last4":cardDetails[cnt].last4,
                    "id":cardDetails[cnt].id,
                    "isDefault": false
                  });
                }
              }
              cnt = cnt + 1;
              if(cnt == cardDetails.length){
                let finalResponse = defaultData.concat(responseData);
                if(finalResponse.length > 0){
                  return resolve({status:1,data:finalResponse});
                } else {
                  return resolve({status:3})
                }
              }
            }
          }
        }
      } else {
        return resolve({status:3});
      }
    })
  }

  async transferBalance(){
    if(this.fundTransferForm.valid){
      this.loaderService.display(true);
      let amount = this.fundTransferForm.get('amount').value;
      let accountId = this.fundTransferForm.get('account').value.account;
      let destinationId = this.fundTransferForm.get('account').value.id;
      if(this.availableBal < amount){
        this.loaderService.display(false);
        this.messageService.open('error','','Amount should not be exceed then Avaliable Balance',true,'');
        this.fundTransferForm.controls['amount'].setValue(''); 
      } else {
        let payoutObject = {
          userId: this.myProfile.id,
          amount: amount,
          currency: "usd",
          accountId: accountId,
          destinationId: destinationId,
          description: "Transfer Amount",
          sourceType: this.sourceType
        }
        let sendPayout: any = await this.paymentService.addPayout(payoutObject);
        this.loaderService.display(false);
        if(sendPayout.result.status === 1){
          let message = 'Transferred to ' + this.fundTransferForm.get('account').value.last4 + ' : \n $ ' + amount;
          this.messageService.open('success','',message,true,'');
          this.router.navigateByUrl('my-profile/earnings');
        } else {
          let message = 'Transferred to ' + this.fundTransferForm.get('account').value.last4 + ' has been failed!';
          this.messageService.open('error','',message,true,'');
        }
      }
    }
  }

  // async getTransferHistory(){
  //   return new Promise(async (resolve, reject) => {
  //     let availableOn = Math.round(Number(Date.now() / 1000));
  //     let requestData = {
  //       userId:this.myProfile.id,
  //       // availableOn:availableOn
  //     }
  //     let history: any = await this.paymentService.getTransferHistory(requestData);
  //     console.log("history",history);
  //     if(history && history.result && history.result.data && history.result.data.length > 0){
  //       let setHistoryData = await this.setHistory(history.result.data);
  //     }
  //     return resolve(true);
  //   })
  // }

  // async setHistory(data){
  //   return new Promise(async (resolve, reject) => {
  //     let cnt = 0;
  //     console.log("in history data");
  //     this.availableBal = 0;
  //     for (let index = 0; index < data.length; index++) {
  //       const element = data[cnt];
  //       if(element.status === "available"){
  //         this.availableBal += Number(element.amount / 100) 
  //       } 
  //       cnt = cnt + 1;
  //       if(cnt == data.length){
  //         return resolve(true);
  //       }
  //     }
  //   })
  // }

}
