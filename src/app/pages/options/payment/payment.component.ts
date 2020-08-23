import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService, ChatService } from 'src/app/services';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  title: string = 'PAYMENT METHODS';
  cardList;
  rgtBtn;
  isEditMode: boolean = false;
  myProfile;
  isDateHer: boolean = false;
  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private messageService: MessageModalComponent,
    public loaderService: LoaderService,
    public paymentService: PaymentService,
    public chatService: ChatService
  ) { }

  async ngOnInit() {
    if(this.route.snapshot.params.dateHer != undefined){
      this.isDateHer = true;
    }
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    let getCards = await this.getCardDetails();
  }

  back() {
    if(this.isDateHer === true){
      this.router.navigate(['/feed-detail/date-her/' + this.route.snapshot.params.dateHer + '/4']);
    } else {
      this.router.navigate(['options']);
    }
  }

  addCard(){
    if(this.isEditMode === false){
      const user = JSON.parse(localStorage.getItem('me'));
      if(user && user.stripe && user.stripe.stripe_customer_id != ""){
        let setAsDefault = false;
        if(!this.cardList || this.cardList.length <= 0){
          setAsDefault = true;
        }
        if(this.isDateHer === true){
          this.router.navigate(['options/payment/add-card/' + setAsDefault + '/' + this.route.snapshot.params.dateHer]);
        } else {
          this.router.navigate(['options/payment/add-card/' + setAsDefault]);
        }
      } else {
        this.messageService.open('error', '', 'Invalid customer for add card!', false, '');
      }
    }
  }



  getCardDetails(){
    return new Promise(async (resolve,reject)=>{
      const user = JSON.parse(localStorage.getItem('me'));
      this.myProfile = user;
      if(user && user.stripe && user.stripe.stripe_customer_id != ""){
        let requestData = {
          userId: user.id,
          customerId: user.stripe.stripe_customer_id
        }
        this.loaderService.display(true);
        let getCards: any = await this.paymentService.getCustomerCards(requestData);
        if(getCards.result.status === 2 || getCards.result.status === 3){
          this.cardList = [];
        } else if (getCards.result.status === 5){
          this.cardList = [];
          this.messageService.open('error', '', 'Customer is not found!', false, '');
          this.router.navigateByUrl('/options');
        } else {
          this.cardList = getCards.result.data;
          if(this.cardList && this.cardList.length > 1){
            this.rgtBtn = "EDIT"
            let setButtonValues = await this.setDefaultDeleteButtonValue(0);
          }
        }
        this.loaderService.display(false);
      } else {
        this.messageService.open('error', '', 'Invalid customer for add card!', false, '');
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
        if(cnt > 0){
          if(cnt != index){
            this.cardList[cnt]['isAllowDelete'] = true;
            this.cardList[cnt]['isDelete'] = false;
          }
        }
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
    let setButtonValues = await this.setDefaultDeleteButtonValue(index); 
  }

  async disallowDelete(index){
    this.cardList[index]['isAllowDelete'] = true;
    this.cardList[index]['isDelete'] = false;
  }

  async deleteCard(index){
    let cardId = this.cardList[index].id;
    let requestData = {
      userId: this.myProfile.id,
      customerId: this.myProfile.stripe.stripe_customer_id,
      cardId: cardId
    }
    this.loaderService.display(true);
    let deleteCard = await this.paymentService.deleteCustomerCard(requestData);
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
      if(this.myProfile.stripe.default_stripe_source != cardData.id){
        let requestData = {
          userId: this.myProfile.id,
          customerId: this.myProfile.stripe.stripe_customer_id,
          cardId: cardData.id,
          paymentMethodLabel: cardData.brand + " " + cardData.last4
        }
        this.loaderService.display(true);
        let setDefaultCard = await this.paymentService.setDefaultCustomerCard(requestData);
        let getCards = await this.getCardDetails();
        let refreshData = await this.chatService.refreshMeData(this.myProfile.id);
        if(this.isDateHer === true){
          this.router.navigate(['/feed-detail/date-her/' + this.route.snapshot.params.dateHer + '/4']);
        }
        this.loaderService.display(false);
      }
    }
  }
}
