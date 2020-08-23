import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { MessageModalComponent } from 'src/app/components';
import { LoaderService, PaymentService } from 'src/app/services';
import { AngularFireAuth } from '@angular/fire/auth';
import { DBREFKEY } from '@shared/constant/dbRefConstant';
import { Countries } from '@shared/constant/countries';
import { CONSTANT } from '@shared/constant';
import { environment } from '../../../../../environments/environment';

import { AngularFireFunctions } from '@angular/fire/functions';

declare var Stripe; // : stripe.StripeStatic;

@Component({
  selector: 'app-add-female-card',
  templateUrl: './add-female-card.component.html',
  styleUrls: ['./add-female-card.component.css']
})
export class AddFemaleCardComponent implements OnInit {
  title: string = 'ADD CARD';
  rgtBtn: string = 'SAVE';
  stripe; // : stripe.Stripe;
  isCardValid: boolean = false;
  card;
  myProfile;
  accountId;

  constructor(
    private router: Router,
    public loaderService: LoaderService,
    public paymentService: PaymentService,
    private _formBuilder: FormBuilder,
    private firebaseDBService: AngularFireDatabase,
    private firebaseService: AngularFireAuth,
    private route: ActivatedRoute,
    private messageService: MessageModalComponent,
  ) { }

  ngOnInit() {
    this.accountId = localStorage.getItem("femaleAccountId");
    this.myProfile = JSON.parse(localStorage.getItem('me'));
    this.stripe = Stripe(environment.STRIPE_KEYS.publishableKeyLive);
    this.initStripeForm();
  }

  initStripeForm() {
    // Create an instance of Elements.
    var elements = this.stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    var style = {
      base: {
        color: '#E2D291',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '12px',
        '::placeholder': {
          color: '#514B35'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.card = elements.create('card', { hidePostalCode: true, style: style });
    this.card.mount('#card-element');

    let that = this;
    this.card.addEventListener('change', function (event) {
      if (event.error) {
        let message = event.error.message;
        that.messageService.open('error', '', message, false, '');
      } else {
        if (event.complete === true) {
          that.isCardValid = true;
        }
      }
    });
  }

  back() {
    if(this.route.snapshot.params.dateHer != undefined && this.route.snapshot.params.dateHer != ""){
      this.router.navigate(['/options/female-account/' + this.route.snapshot.params.dateHer]);
    } else {
      this.router.navigate(['options/female-account']);
    } 
  }

  async right() {
    if (!this.isCardValid) {
      this.messageService.open('error', '', 'Card details is invalid or incomplete!', false, '');
    } else {
      this.loaderService.display(true);
      let getStripeTokenData: any = await this.getStripeToken();
      if (getStripeTokenData.status === 3) {
        this.loaderService.display(false);
        this.messageService.open('error', '', getStripeTokenData.message, false, '');
      }
      let stripeToken = getStripeTokenData.data;
      let setAsDefault = this.route.snapshot.params.setAsDefault;
      let accountId = this.myProfile.default_stripe_connect_source;
      if(accountId != undefined && accountId != ''){
        let requestData = {
          userId: this.myProfile.id,
          accountId: accountId,
          token: stripeToken.id,
          setAsDefault:setAsDefault
        }
        this.isCardValid = false;
        let addCard : any = await this.paymentService.createFemaleCard(requestData);
        if(addCard && addCard.result && addCard.result.status === 5){
          this.loaderService.display(false);
          var message = addCard.result.message.raw.message;
          this.messageService.open('error', '', message, false, '');
        } else {
          this.loaderService.display(false);
          this.router.navigate(['options/female-account']);
        }
      } else {
        console.log("code is not found");
      }
    }
  }

  getStripeToken() {
    return new Promise((resolve, reject) => {
      this.stripe.createToken(this.card,{currency:"usd",default_for_currency:true}).then(function (result) {
        if (result.error) {
          // Inform the user if there was an error.
          let message = result.error.message;
          return resolve({ status: 3, message: message });
        } else {
          return resolve({ status: 1, data: result.token });
        }
      });
    })
  }

}
