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
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.css']
})
export class AddCardComponent implements OnInit {
  title: string = 'ADD CARD';
  rgtBtn: string = 'SAVE';
  stripe; // : stripe.Stripe;
  isCardValid: boolean = false;
  card;
  myProfile;

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
    this.myProfile = JSON.parse(localStorage.getItem('me'));
    if (!this.myProfile || !this.myProfile.stripe || this.myProfile.stripe.stripe_customer_id == "") {
      this.messageService.open('error', '', 'Invalid customer for add card!', false, '');
      this.router.navigate(['options/payment']);
    }
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
      this.router.navigate(['/options/payment/' + this.route.snapshot.params.dateHer]);
    } else {
      this.router.navigate(['options/payment']);
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
      let customerId = this.myProfile.stripe.stripe_customer_id;
      let setAsDefault = this.route.snapshot.params.setAsDefault;
      let requestData = {
        userId: this.myProfile.id,
        customerId: customerId,
        token: stripeToken.id,
        setAsDefault:setAsDefault
      }
      let addCard = await this.paymentService.createCustomerCard(requestData);
      this.isCardValid = false;
      this.loaderService.display(false);
      if(this.route.snapshot.params.dateHer != undefined && this.route.snapshot.params.dateHer != ""){
        this.router.navigate(['/feed-detail/date-her/' + this.route.snapshot.params.dateHer + '/4']);
      } else {
        this.router.navigate(['options/payment']);
      } 
    }
  }

  getStripeToken() {
    return new Promise((resolve, reject) => {
      this.stripe.createToken(this.card).then(function (result) {
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
