import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService, ChatService } from 'src/app/services';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-female-account',
  templateUrl: './female-account.component.html',
  styleUrls: ['./female-account.component.scss']
})
export class FemaleAccountComponent implements OnInit {

  title;
  cardList;
  rgtBtn;
  isEditMode: boolean = false;
  myProfile;
  isDateHer: boolean = false;
  accountId;
  hasAccount: boolean = false;
  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public loaderService: LoaderService,
    public paymentService: PaymentService,
    public chatService: ChatService
  ) { }

  async ngOnInit() {
    this.myProfile = JSON.parse(localStorage.getItem('me'));
    if(this.myProfile.accountType === 'custom'){
      this.hasAccount = true;
    }
    this.title = "ACCOUNTS";
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    let getCards = await this.getCardDetails();
  }

  back() {
    let redirectionUrl = localStorage.getItem('redirectionFromFemaleAccountPage');
    if(redirectionUrl === 'earning'){
      localStorage.removeItem('redirectionFromFemaleAccountPage');
      this.router.navigate(['/my-profile/earnings']);
    } else if(redirectionUrl === 'accept-date'){
      let acceptDateId = localStorage.getItem('acceptDateId');
      localStorage.removeItem('redirectionFromFemaleAccountPage');
      localStorage.removeItem('acceptDateId');
      this.router.navigate(['/accept-date/' + acceptDateId]);
    } else {
      this.router.navigate(['options']);
    }
  }

  async addCard(){
    localStorage.setItem("femaleAccountId",this.myProfile.stripeConnect[0].accountId);
    this.router.navigate(['options/female-account/add-female-card']);
  }

  getCardDetails(){
    return new Promise(async (resolve,reject)=>{
      const user = JSON.parse(localStorage.getItem('me'));
      this.myProfile = user;
      if(user.accountType === 'custom'){
        let requestData = {
          userId: user.id,
          accountId: user.default_stripe_connect_source
        }
        this.loaderService.display(true);
        let getCards: any = await this.paymentService.getFemaleCustomCards(requestData);
        if(getCards.result.status === 2 || getCards.result.status === 3){
          this.cardList = [];
        } else if (getCards.result.status === 5){
          this.cardList = [];
          this.messageService.open('error', '', 'Account is not found!', false, '');
          this.router.navigateByUrl('/options');
        } else {
          this.cardList = getCards.result.data;
          if(this.cardList && this.cardList.length > 1){
            this.rgtBtn = "EDIT"
          }
          let setButtonValues = await this.setDefaultDeleteButtonValue(0);
        }
        this.loaderService.display(false);
      }
      return resolve(true);
    });
  }

  async right(){
    if(this.rgtBtn === "EDIT"){
      this.rgtBtn = "DONE";
      this.isEditMode = true;
    } else if(this.rgtBtn === "DONE"){
      if(this.cardList.length > 1){
        this.rgtBtn = "EDIT"
        let setButtonValues = await this.setDefaultDeleteButtonValue(0);
      } else {
        this.rgtBtn = "";
      }
      this.isEditMode = false;
    }
  }

  setDefaultDeleteButtonValue(index){
    return new Promise((resolve,reject)=>{
      let cnt = 0;
      for(let i=0; i < this.cardList.length; i++){
        if(this.cardList[cnt].default_for_currency === false){
          this.cardList[cnt]['isAllowDelete'] = true;
          this.cardList[cnt]['isDelete'] = false;
          this.cardList[cnt]['isDefault'] = false;
        } else {
          this.cardList[cnt]['isDefault'] = true;
        }
        cnt = cnt + 1;
        if(cnt == this.cardList.length){
          return resolve(true);
        }
      }
    })
  }

  setDeleteButtonValue(index){
    return new Promise((resolve,reject)=>{
      let cnt = 0;
      for(let i=0; i < this.cardList.length; i++){
        //if(cnt > 0){
          if(cnt != index){
            if(this.cardList[cnt].default_for_currency === false){
              this.cardList[cnt]['isAllowDelete'] = true;
              this.cardList[cnt]['isDelete'] = false;
              this.cardList[cnt]['isDefault'] = false;
            } else {
              this.cardList[cnt]['isDefault'] = true;
            }
          }
        //}
        cnt = cnt + 1;
        if(cnt == this.cardList.length){
          return resolve(true);
        }
      }
    })
  }

  async allowDelete(index){
    this.cardList[index]['isAllowDelete'] = false;
    this.cardList[index]['isDelete'] = true;
    let setButtonValues = await this.setDeleteButtonValue(index); 
  }

  async disallowDelete(index){
    this.cardList[index]['isAllowDelete'] = true;
    this.cardList[index]['isDelete'] = false;
  }

  async deleteCard(index){
    let cardId = this.cardList[index].id;
    let requestData = {
      userId: this.myProfile.id,
      accountId: this.myProfile.default_stripe_connect_source,
      cardId: cardId
    }
    this.loaderService.display(true);
    let deleteCard = await this.paymentService.deleteFemaleCustomCard(requestData);
    this.cardList.splice(index, 1);
    if(this.cardList.length === 1){
      this.rgtBtn = "";
      this.isEditMode = false;
    }
    this.loaderService.display(false);
  }

  async setAsDefault(cardData){
    this.myProfile = JSON.parse(localStorage.getItem('me'));
    if(this.isEditMode === false){
      if(cardData.isDefault === false){
        let requestData = {
          userId: this.myProfile.id,
          accountId: this.myProfile.stripeConnect[0].accountID,
          cardId: cardData.id,
          paymentMethodLabel: cardData.brand + " " + cardData.last4
        }
        this.loaderService.display(true);
        let setDefaultCard = await this.paymentService.setDefaultFemaleCustomCard(requestData);
        let getCards = await this.getCardDetails();
        let refreshData = await this.chatService.refreshMeData(this.myProfile.id);
        this.loaderService.display(false);
      }
    }
  }

  addAccount(){
    this.router.navigate(['options/female-account/add-female-account']);
  }
}
